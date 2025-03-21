const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("./database");
const { type } = require("os");
const fs = require("fs");
const cron = require('node-cron');
const { encrypt, decrypt, getKey } = require("./encryption");
require("dotenv").config();
const { spawn } = require('child_process');
const queryDatabase = require("./database");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(
	session({
		secret: "attendEase",
		resave: false,
		saveUninitialized: false,
		cookie: {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        }
	})
);
app.use(passport.initialize());
app.use(passport.session());

const dbConfig = {
    database: path.join(__dirname, 'DATABASE.FDB'),
    backupDir: path.join(__dirname, 'backups'),
};

function createBackup() {
    const backupFile = path.join(dbConfig.backupDir, `database_backup_${new Date().toISOString().slice(0, 10)}.FDB`);
    
    fs.copyFile(dbConfig.database, backupFile, (err) => {
        if (err) {
            console.error("Error during backup:", err);
        }
    });
}

cron.schedule('0 0 * * 1', () => {
    createBackup();
});

passport.use(
	new LocalStrategy(async (username, password, done) => {
		const users = await db("SELECT * FROM USERS")

		if (users.length === 0) return done(null, false, { message: "No users in database" });

		const user = users.find(user => user.username === username);

		if (!user) return done(null, false, { message: "User not found" });
		if (!bcrypt.compareSync(password, user.password)) return done(null, false, { message: "Incorrect password" });

		return done(null, user);
	})
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	try {
        const user = await db("SELECT * FROM USERS WHERE id = ?", [id]);
        if (user && user.length > 0) {
            done(null, user[0]);
        } else {
            done(new Error("User not found"));
        }
    } catch (err) {
        done(err);
    }
});

app.get("/api/hello", (req, res) => {
	res.json({ message: "Hello from server!" });
});

app.post("/api/authenticate", (req, res, next) => {
	const enteredPassword = req.body.password;
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);
		if (!user) return res.status(401).json({ status: "fail", error: info.message });

		req.logIn(user, (err) => { 
			if (err) return next(err);
			req.session.enteredPassword = enteredPassword;
			res.json({ status: "success", user: user });
		});
	})(req, res, next);
});

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.status(401).json({ status: "fail" })
}

app.get("/api/get_credentials", isAuthenticated, (req, res) => {
	const password = req.session.enteredPassword
	const email = decrypt(req.user.email, getKey(password, req.user.password.split("$")[3]), Buffer.from(req.user.iv, 'hex'))
	const accountType = decrypt(req.user.account_type, getKey(password, req.user.password.split("$")[3]), Buffer.from(req.user.iv, 'hex')) 
	res.json({ status: "success", user: { username: req.user.username, email: email, account_type: accountType } });
});

app.post("/api/mark_attendance/ip", isAuthenticated, (req, res) => {
	const { ip } = req.body 
	if (process.env.CRITERIA_IP === ip) {
		req.session.ip = true 
		return res.json({ status: "success" });
	}

	req.session.ip = false
	return res.json({ status: "fail" });
})

app.post("/api/mark_attendance/time", isAuthenticated, (req, res) => {
	const currentTime = new Date()
	req.session.submitted_time = currentTime.toISOString();
  	const currentHour = currentTime.getHours();

	if (currentHour >= parseInt(process.env.CRITERIA_START_TIME) && currentHour < parseInt(process.env.CRITERIA_END_TIME)) {
		req.session.time = true
		return res.json({ status: "success" });
	}

	req.session.time = false
	return res.json({ status: "fail" });  
})

app.post("/api/mark_attendance/location", isAuthenticated, (req, res) => {
	const { latitude, longitude } = req.body;
	const topLeftLat = parseFloat(process.env.CRITERIA_TOP_LEFT_LATITUDE);
	const topLeftLon = parseFloat(process.env.CRITERIA_TOP_LEFT_LONGITUDE);
	const bottomRightLat = parseFloat(process.env.CRITERIA_BOTTOM_RIGHT_LATITUDE);
	const bottomRightLon = parseFloat(process.env.CRITERIA_BOTTOM_RIGHT_LONGITUDE);

	const isWithinBounds = (
		latitude >= bottomRightLat && latitude <= topLeftLat &&	
		longitude >= topLeftLon && longitude <= bottomRightLon
	);

	if (isWithinBounds) {
		req.session.location = true
		return res.json({ status: "success" }); 
	}

	req.session.location = false
	return res.json({ status: "fail" }); 
})

app.post("/api/mark_attendance/face", isAuthenticated, (req, res) => {
	const base64Data = req.body.image.replace(/^data:image\/jpeg;base64,/, '');
    const imagePath = path.join(__dirname, `captured_${Date.now()}.jpg`);
	fs.writeFileSync(imagePath, base64Data, 'base64');

	const referenceImage = 'WIN_20250310_21_00_39_Pro.jpg';
	const faceRecognition = spawn('python', ['face_recognition1.py', referenceImage, imagePath]);

	faceRecognition.stdout.on('data', (data) => {
		const result = data.toString().trim();
		req.session.face = result === 'Match'
		return res.json({ status: result === 'Match' ? "success" : "fail" });
	});

	req.session.face = false
	faceRecognition.stderr.on('data', (data) => { 
		console.error(`Python Error: ${data}`);
        return res.status(500).json({ error: 'Face recognition failed' });
	});
})

app.post("/api/mark_attendance/submit", (req, res) => {
	if ([req.session.ip, req.session.time, req.session.face, req.session.location].every(Boolean)) {
		const submittedTime = req.session.submitted_time
		const processedTime = new Date().toISOString()

		const encryptedAttendanceDateTime = encrypt(submittedTime, getKey(req.session.enteredPassword, req.user.password.split("$")[3]), Buffer.from(req.user.iv, 'hex'))
		const encryptedUpdatedDateTime = encrypt(processedTime, getKey(req.session.enteredPassword, req.user.password.split("$")[3]), Buffer.from(req.user.iv, 'hex'))
		const encryptedStatus = encrypt("1", getKey(req.session.enteredPassword, req.user.password.split("$")[3]), Buffer.from(req.user.iv, 'hex'))
	
		queryDatabase("SELECT COALESCE(MAX(id), 0) FROM attendance;")
		.then(data => {
			queryDatabase("INSERT INTO attendance VALUES(?, ?, ?, ?, ?, ?)", [data[0].coalesce, req.user.id, encryptedAttendanceDateTime, encryptedUpdatedDateTime, encryptedStatus, null])
			.then(() => {
				res.json({ status: "success" })
			})
		})
	} else {
		return res.json({ status: "fail", message: "You have not completed all checks" })
	}
})

if (process.env.NODE_ENV !== "test") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = app;