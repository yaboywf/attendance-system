const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("./database");
const fs = require("fs");
const cron = require('node-cron');
const { encrypt, decrypt, getKey, decryptImage, createIv, encryptImage } = require("./encryption");
const { spawn } = require('child_process');
const queryDatabase = require("./database");
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const { text } = require("stream/consumers");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));

app.use(cors({
    origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
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

app.use(helmet());
app.use(
	helmet.referrerPolicy({
		policy: 'no-referrer-when-downgrade',
	})
);

app.use(
	helmet.hsts({
		maxAge: 31536000,
		includeSubDomains: true,
		preload: true,
	})
);

app.use(
	helmet.crossOriginOpenerPolicy({
		policy: 'same-origin'
	})
);

app.use(
	helmet.noSniff()
);
  
app.use(
	helmet.frameguard({
	  	action: 'sameorigin',
	})
);
  
app.use(
	helmet.xssFilter()
);

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: ["'self'"],
			scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
			imgSrc: ["'self'", "data:"],
			connectSrc: ["'self'"],
			fontSrc: ["'self'", "https://fonts.gstatic.com"],
			objectSrc: ["'none'"],
			mediaSrc: ["'self'"],
			frameSrc: ["'none'"],
			childSrc: ["'none'"],
			formAction: ["'self'"], // Allow form submissions only to the same origin
			frameAncestors: ["'none'"],
			manifestSrc: ["'self'"],
			upgradeInsecureRequests: [],
		},
	})
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Expires', '0');
	next();
});

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAIL_ADDRESS,
		pass: process.env.EMAIL_PASSWORD
	},
	tls: {
		rejectUnauthorized: false,
	},
});

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

app.put("/api/logout", isAuthenticated, (req, res) => {
	req.logout((err) => {
		if (err) {
			return res.status(500).json({ status: "fail", message: "Error logging out" });
		}

		req.session.destroy((err) => {
			if (err) {
			 	return res.status(500).json({ status: "fail", message: "Error clearing session" });
			}

			res.json({ status: "success" });
		})
	});
})

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

app.get("/api/get_user_image", isAuthenticated, (req, res) => {
	queryDatabase("SELECT cast(user_image as BLOB SUB_TYPE BINARY) user_image FROM users WHERE id = ?;", [req.user.id])
	.then(result => {
		const image = result[0].user_image;

		image(function (err, _, e) {
			if (err) {
				res.status(500).send("Error retrieving image");
				return;
			}

			let buffers = [];
			e.on('data', function (chunk) {
				buffers.push(chunk);
			});

			e.on('end', function () {
				let buffer = Buffer.concat(buffers);
				try {
					const key = getKey(req.session.enteredPassword, req.user.password.split("$")[3]);
					const iv = Buffer.from(req.user.iv, 'hex')
					const decryptedImageBuffer = decryptImage(buffer, key, iv);
		
					res.setHeader('Content-Type', 'image/jpeg');
					res.send(decryptedImageBuffer);
				} catch (decryptionError) {
					console.error('Decryption failed:', decryptionError.message);
				}
			});
		});
	})
})

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
    const capturedImageBuffer = Buffer.from(base64Data, 'base64');

	queryDatabase("SELECT cast(user_image as BLOB SUB_TYPE BINARY) user_image FROM users WHERE id = ?;", [req.user.id])
	.then(result => {
		const image = result[0].user_image;

		if (!image) {
			return res.status(404).send("User image not found.");
		}

		image(function (err, _, e) {
			if (err) {
				return res.status(500).send("Error retrieving image");
			}

			let buffers = [];
			e.on('data', function (chunk) {
				buffers.push(chunk);
			});

			e.on('end', function () {
				let buffer = Buffer.concat(buffers);
				try {
					const key = getKey(req.session.enteredPassword, req.user.password.split("$")[3]);
					const iv = Buffer.from(req.user.iv, 'hex')
					const decryptedImageBuffer = decryptImage(buffer, key, iv);
					
					const faceRecognition = spawn('python', ['face_recognition1.py']);
					faceRecognition.stdin.write(decryptedImageBuffer);
					faceRecognition.stdin.write(Buffer.from("====SEPARATOR===="));
					faceRecognition.stdin.write(capturedImageBuffer);
					faceRecognition.stdin.end();

					faceRecognition.stdout.on('data', (data) => {
						const result = data.toString().trim();
						req.session.face = result === 'Match'
						return res.json({ status: result === 'Match' ? "success" : "fail" });
					});

					faceRecognition.stderr.on('data', (data) => { 
						console.error(`Python Error: ${data}`);
						if (!res.headersSent) {
                            return res.status(500).json({ error: 'Face recognition failed' });
                        }
					});
				} catch (decryptionError) {
					req.session.face = false
					console.error('Decryption failed:', decryptionError.message);
					if (!res.headersSent) {
                        return res.status(500).send("Decryption error");
                    }
				}
			});
		});
	})
})

app.post("/api/mark_attendance/submit", (req, res) => {
	if ([req.session.ip, req.session.time, req.session.face, req.session.location].every(Boolean)) {
		const submittedTime = req.session.submitted_time
		const processedTime = new Date().toISOString()

		const encryptedAttendanceDateTime = encrypt(submittedTime, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(req.user.iv, 'hex'))
		const encryptedUpdatedDateTime = encrypt(processedTime, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(req.user.iv, 'hex'))
		const encryptedStatus = encrypt("1", Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(req.user.iv, 'hex'))
	
		queryDatabase("SELECT COALESCE(MAX(id), 0) FROM attendance;")
		.then(data => {
			queryDatabase("INSERT INTO attendance VALUES(?, ?, ?, ?, ?, ?, ?)", [data[0].coalesce + 1, req.user.id, encryptedAttendanceDateTime, encryptedUpdatedDateTime, encryptedStatus, null, req.user.iv])
			.then(() => {
				res.json({ status: "success" })
			})
		})
	} else {
		return res.json({ status: "fail", message: "You have not completed all checks" })
	}
})

app.put("/api/update_email", (req, res) => {
	const newEmail = req.body.email;

	if (newEmail === "") return res.status(400).json({ status: "fail", message: "Email cannot be empty" })

	const encryptedEmail = encrypt(newEmail, getKey(req.session.enteredPassword, req.user.password.split("$")[3]), Buffer.from(req.user.iv, "hex"))
	queryDatabase("UPDATE users SET email = ? WHERE id = ?", [encryptedEmail, req.user.id])
	.then(() => {
		return res.json({ status: "success" })
	})
	.catch(err => {
		return res.json({ status: "fail", message: err })
	})
})

app.post("/api/forms", isAuthenticated, (req, res) => {
	const startDate = req.body.start_date
	const endDate = req.body.end_date
	const formType = req.body.form_type
	const reason = req.body.reason

	if (new Date(endDate) < new Date(startDate)) return res.status(422).json({ status: "fail", message: "End date cannot be earlier than start date"})
	if (formType.toLowerCase() === "loa" && reason === "") return res.status(422).json({ status: "fail", message: "Reason is required but is empty" }) 

	const base64Data = req.body.file.replace(/^data:image\/jpeg;base64,/, '');
    const fileBuffer = Buffer.from(base64Data, 'base64');
	const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex")
	const encryptionIv = createIv()

	const encryptedFile = encryptImage(fileBuffer, encryptionKey, encryptionIv)
	const encryptedStartDate = encrypt(startDate, encryptionKey, encryptionIv)
	const encryptedEndDate = encrypt(endDate, encryptionKey, encryptionIv)
	const encryptedReason = reason ? encrypt(reason, encryptionKey, encryptionIv) : null
	const encryptedStatus = encrypt("pending", encryptionKey, encryptionIv)
	const encryptedFormType = encrypt(formType.toLowerCase(), encryptionKey, encryptionIv)

	queryDatabase("SELECT COALESCE(MAX(id), 0) FROM forms_new;")
	.then(result => {
		const newId = result[0].coalesce + 1
		queryDatabase("INSERT INTO forms_new VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)", [newId, req.user.id, encryptedFormType, encryptedStartDate, encryptedEndDate, encryptedReason, encryptedStatus, encryptedFile, encryptionIv.toString('hex')])
		.then(() => {
			res.json({ status: "success" })
		})
	})
	.catch(err => {
		res.status(500).json({ status: "fail", message: err })
	})
})

app.post("/api/forget_password", (req, res) => {
	const email = req.body.email
	if (!email || email === "") return res.status(400).json({ status: "fail", message: "Email cannot be empty" })

	const resetId = createIv().toString('hex')

	queryDatabase("SELECT hashed_email FROM users;")
	.then(result => {
		let requestedUser = null;
		result.forEach(user => {
			if (bcrypt.compareSync(email, user.hashed_email)) {
				requestedUser = user.id;
				queryDatabase("INSERT INTO resets VALUES(?, ?, ?)", [resetId, requestedUser, new Date().setHours(new Date().getHours() + 1)])
				.then(() => {
					const mailOptions = {
						from: process.env.EMAIL_ADDRESS,
						to: email,
						subject: "AttendEase - Password Reset",
						text: `
Hello ${email},

You have requested to reset your password for AttendEase. Please click the following link to reset your password:

http://127.0.0.1:3001/forget_password/verify/${resetId}

For security reasons, do not share this link with anyone else. This link will expire in 1 hour. 

If you did not request to reset your password, please ignore this email.

Kind regards,
AttendEase
						`
					}
			
					transporter.sendMail(mailOptions, (error, info) => {
						if (error) {
							console.log('Error sending email:', error);
						}
			
						return res.json({ status: "success" })
					});
				})
				.catch(err => {
					return res.json({ status: "fail", message: err })
				})
			}
		})
	})
	.catch(err => {
		return res.json({ status: "fail", message: err })
	})
})

app.post("/api/verify/:resetId", (req, res) => {
	const resetId = req.params.resetId
	if (!resetId || resetId === "") return res.status(400).json({ status: "fail", message: "Reset ID cannot be empty" })

	queryDatabase("SELECT * FROM resets WHERE id = ?;", [resetId])
	.then(result => {
		if (result.length > 0) {
			const user = result[0];
			const expiry = new Date(user.expiry);
			const now = new Date();

			if (now > expiry) {
				queryDatabase("DELETE FROM resets WHERE reset_id = ? OR expiry < CAST(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) * 1000 AS BIGINT);", [resetId])
				.then(() => {
					return res.status(400).json({ status: "fail", message: "Link is invalid or has expired" })
				})
				.catch(err => {
					return res.status(400).json({ status: "fail", message: err })
				})
			}

			return res.json({ status: "success" })
		} else {
			return res.status(400).json({ status: "fail", message: "Link is invalid or has expired" })
		}
	})
})

if (process.env.NODE_ENV !== "test") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = app;