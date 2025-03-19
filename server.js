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
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cors({
    origin: 'http://127.0.0.1:3001',
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
        } else {
            console.log(`Backup successful: ${backupFile}`);
        }
    });
}

cron.schedule('0 0 * * 1', () => {
    console.log("Starting weekly backup...");
    createBackup();
});

passport.use(
	new LocalStrategy(async (username, password, done) => {
		const users = await db("SELECT * FROM USERS")

		if (users.length === 0) return done(null, false, { message: "No users in database" });

		const user = users.find(user => user.username === username);

		if (!user) return done(null, false, { message: "User not found" });
		if (bcrypt.compareSync(password, user.password)) return done(null, false, { message: "Incorrect password" });

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
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);
		if (!user) return res.status(401).json({ status: "fail", error: info.message });

		req.logIn(user, (err) => {
			if (err) return next(err);

			res.json({ status: "success", user: user });
		});
	})(req, res, next);
});

function isAuthenticated(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.status(401).json({ status: "fail" })
}

app.get("/api/get_credentials", isAuthenticated, (req, res) => {
	res.json({ status: "success", user: req.user});
});

app.post("/api/mark_attendance/ip", isAuthenticated, (req, res) => {
	if (process.env.CRITERIA_IP === req.body.ip) {
		res.json({ status: "success" });
	}

	res.json({ status: "fail" });
})

app.post("/api/mark_attendance/time", isAuthenticated, (req, res) => {
	const { time } = req.body;
	const currentTime = new Date(time);
  	const currentHour = currentTime.getHours();

	if (currentHour >= parseInt(process.env.CRITERIA_START_TIME) && currentHour < parseInt(process.env.CRITERIA_END_TIME)) {
		res.json({ status: "success" });
	}

	res.json({ status: "fail" });
})

function checkLocation(lat1, lon1, lat2, lon2) {
	const R = 6371;
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const distance = R * c;
	return distance;
}

app.post("/api/mark_attendance/location", isAuthenticated, (req, res) => {
	const { latitude, longitude } = req.body;
	if (latitude && longitude) {
		const distance = checkLocation(latitude, longitude, parseFloat(process.env.CRITERIA_LATITUDE), parseFloat(process.env.CRITERIA_LONGITUDE)) <= parseFloat(process.env.CRITERIA_RADIUS)		

		if (distance) res.json({ status: "success" });
	}

	res.json({ status: "fail" });
})

if (process.env.NODE_ENV !== "test") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = app;