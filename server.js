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
const sharp = require('sharp');
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
	const email = req.user.email === "" ? "" : decrypt(req.user.email, getKey(password, req.user.password.split("$")[3]), Buffer.from(req.user.iv, 'hex'))
	const accountType = decrypt(req.user.account_type, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(req.user.iv, 'hex'))
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
						const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex")
						const iv = Buffer.from(req.user.iv, 'hex')
						const decryptedImageBuffer = decryptImage(buffer, key, iv);
						
						sharp(decryptedImageBuffer).toFormat('webp').toBuffer()
							.then(webpBuffer => {
								res.setHeader('Content-Type', 'image/webp');
								res.send(webpBuffer);
							})
							.catch(() => {
								res.status(400).send('Invalid image format or error converting image');
							});
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
						const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex")
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
	queryDatabase("UPDATE users SET email = ?, hashed_email = ? WHERE id = ?", [encryptedEmail, bcrypt.hashSync(newEmail), req.user.id])
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

	if (new Date(endDate) < new Date(startDate)) return res.status(422).json({ status: "fail", message: "End date cannot be earlier than start date" })
	if (formType.toLowerCase() === "loa" && reason === "") return res.status(422).json({ status: "fail", message: "Reason is required but is empty" })

	const base64Data = req.body.file.replace(req.body.file.match(/^data:(image\/(jpeg|jpg|webp|png)|application\/pdf);base64,/)[0], '');
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

	queryDatabase("SELECT id, hashed_email FROM users;")
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

							transporter.sendMail(mailOptions, (error) => {
								if (error) {
									console.error('Error sending email:', error);
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
				const expiry = Number(user.expiry);
				const now = Math.floor(new Date().getTime() / 1000);

				if (now > expiry) {
					queryDatabase("DELETE FROM resets WHERE reset_id = ? OR expiry > ?;", [resetId, now])
						.then(() => {
							return res.status(400).json({ status: "fail", message: "Link is invalid or has expired" })
						})
						.catch(err => {
							return res.status(400).json({ status: "fail", message: err })
						})
				}

				return res.json({ status: "success", user_id: user.user_id })
			} else {
				return res.status(400).json({ status: "fail", message: "Link is invalid or has expired" })
			}
		})
		.catch(() => {
			return res.status(400).json({ status: "fail", message: "Link is invalid or has expired" })
		})
})

app.put("/api/reset_password", (req, res) => {
	const newPassword = req.body.password
	const confirmPassword = req.body.confirm
	const userId = req.body.user_id || req.user.id
	const currentPassword = req.session.enteredPassword || null

	if (!newPassword || newPassword === "") return res.status(422).json({ status: "fail", message: "Password cannot be empty" })
	if (!confirmPassword || confirmPassword === "") return res.status(422).json({ status: "fail", message: "Confirm Password cannot be empty" })
	if (newPassword !== confirmPassword) return res.status(422).json({ status: "fail", message: "Passwords do not match" })

	if (!currentPassword) {
		queryDatabase("UPDATE users SET password = ?, email = '', hashed_email = '' WHERE id = ?;", [bcrypt.hashSync(newPassword), userId])
			.then(() => {
				return res.json({ status: "success" })
			})
			.catch(err => {
				return res.json({ status: "fail", message: err })
			})
	} else {
		if (!bcrypt.compareSync(currentPassword, req.user.password)) return res.status(400).json({ status: "fail", message: "Incorrect password" })

		queryDatabase("SELECT email FROM users WHERE id = ?;", [userId])
			.then(result => {
				const email = result[0].email
				const decryptedEmail = decrypt(email, getKey(currentPassword, req.user.password.split("$")[3]), Buffer.from(req.user.iv, "hex"))
				const hashedPassword = bcrypt.hashSync(newPassword)
				const reEncryptedEmail = encrypt(decryptedEmail, getKey(newPassword, hashedPassword.split("$")[3]), Buffer.from(req.user.iv, "hex"))

				queryDatabase("UPDATE users SET password = ?, email = ? WHERE id = ?;", [hashedPassword, reEncryptedEmail, userId])
					.then(() => {
						return res.json({ status: "success" })
					})
					.catch(err => {
						return res.json({ status: "fail", message: err })
					})
			})
			.catch(err => {
				return res.json({ status: "fail", message: err })
			})
	}
})

app.get("/api/get_attendance", isAuthenticated, (req, res) => {
	queryDatabase("SELECT attendance_datetime, status, remarks, iv FROM attendance WHERE user_id = ?;", [req.user.id])
		.then(result => {
			if (result.length === 0) return res.json({ status: "success", data: [] })

			result.forEach(attendance => {
				attendance.attendance_datetime = decrypt(attendance.attendance_datetime, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(attendance.iv, "hex"))
				attendance.attendance_datetime = attendance.attendance_datetime.split("T")[0]
				attendance.status = decrypt(attendance.status, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(attendance.iv, "hex"))
				attendance.remarks = attendance.remarks === null ? "" : decrypt(attendance.remarks, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(attendance.iv, "hex"))
			})

			return res.json({ status: "success", data: result })
		})
		.catch(err => {
			return res.json({ status: "fail", message: err })
		})
})

app.get("/api/get_forms", isAuthenticated, (req, res) => {
	queryDatabase("SELECT start_date, end_date, status, iv FROM forms_new WHERE user_id = ?;", [req.user.id])
		.then(result => {
			if (result.length === 0) return res.json({ status: "success", data: [] })

			result.forEach(form => {
				form.start_date = decrypt(form.start_date, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(form.iv, "hex"))
				form.start_date = form.start_date.split("T")[0]
				form.end_date = decrypt(form.end_date, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(form.iv, "hex"))
				form.end_date = form.end_date.split("T")[0]
				form.status = decrypt(form.status, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(form.iv, "hex"))
			})

			return res.json({ status: "success", data: result })
		})
		.catch(err => {
			return res.json({ status: "fail", message: err })
		})
})

async function decryptUserImage(user_image, iv) {
	return new Promise((resolve, reject) => {
		const image = user_image;

		image(function (err, _, e) {
			if (err) {
				return reject("Error retrieving image");
			}

			let buffers = [];
			e.on('data', function (chunk) {
				buffers.push(chunk);
			});

			e.on('end', function () {
				let buffer = Buffer.concat(buffers);
				try {
					const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");
					const ivBuffer = Buffer.from(iv, 'hex');
					const decryptedImageBuffer = decryptImage(buffer, key, ivBuffer);
					resolve(decryptedImageBuffer);
				} catch (decryptionError) {
					console.error('Decryption failed:', decryptionError.message);
					reject('Decryption failed');
				}
			});
		});
	});
}

app.get("/api/get_users", async (req, res) => {
	try {
		const result = await queryDatabase("SELECT cast(user_image as BLOB SUB_TYPE BINARY) AS user_image, id, username, account_type, iv FROM users;")

		let students = []
		let lecturers = []

		for (const user of result) {
			try {
				const imageBuffer = await decryptUserImage(user.user_image, user.iv);
				const webpBuffer = await sharp(imageBuffer).toFormat('webp').toBuffer();
				user.user_image = webpBuffer;

				const accountType = decrypt(user.account_type, Buffer.from(process.env.ENCRYPTION_KEY, "hex"), Buffer.from(user.iv, "hex"))
				user.account_type = accountType
				if (accountType.toLowerCase() === "student") {
					students.push(user)
				} else if (accountType.toLowerCase() === "lecturer") {
					lecturers.push(user)
				}
			} catch(err) {
				console.error(err)
			}
		}

		return res.json({ status: "success", data: { students: students, lecturers: lecturers } })
	} catch (err) {
		return res.json({ status: "fail", message: err })
	}
})	

app.post("/api/create_user", isAuthenticated, (req, res) => {
	const { username, password, account_type, user_image } = req.body;

	if (!["student", "lecturer"].includes(account_type.toLowerCase())) return res.status(422).json({ status: "fail", message: "Invalid account type" })

	const base64Data = user_image.replace(user_image.match(/^data:(image\/(jpeg|jpg|webp|png));base64,/)[0], '');
	const fileBuffer = Buffer.from(base64Data, 'base64');
	const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex")
	const encryptionIv = createIv()

	const encryptedFile = encryptImage(fileBuffer, encryptionKey, encryptionIv)
	const hashedPassword = bcrypt.hashSync(password, 10)
	const encryptedAccountType = encrypt(account_type.toLowerCase(), encryptionKey, encryptionIv)

	queryDatabase("SELECT COALESCE(MAX(id), 0) FROM users;")
	.then(result => {
		const newId = result[0].coalesce + 1
		queryDatabase("INSERT INTO users(id, username, password, account_type, user_image, iv) VALUES(?, ?, ?, ?, ?, ?)", [newId, username, hashedPassword, encryptedAccountType, encryptedFile, encryptionIv.toString('hex')])
		.then(() => {
			res.json({ status: "success", message: "User created successfully" })
		})
		.catch(err => {
			res.status(500).json({ status: "fail", message: err })
		})
	})
	.catch(err => {
		res.status(500).json({ status: "fail", message: err })
	})
})

app.put("/api/update_user", isAuthenticated, (req, res) => {
	const { user_id, username, account_type, user_image } = req.body;
	console.log(req.body)

	if (["user_id", "username", "account_type"].filter(field => !req.body.hasOwnProperty(field)).length > 0) return res.status(422).json({ status: "fail", message: 'Missing required keys.'});
	if (!user_id || !username || !account_type) return res.status(422).json({ status: "fail", message: "Fields cannot be empty" })

	let sql = "UPDATE users SET username = ?, account_type = ? WHERE id = ?;"
	const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, "hex")

	queryDatabase("SELECT iv FROM users WHERE id = ?", [user_id])
	.then(result => {
		const encryptionIv = Buffer.from(result[0].iv, "hex")
		const encryptedAccountType = encrypt(account_type.toLowerCase(), encryptionKey, encryptionIv)
		let parameters = [username, encryptedAccountType, user_id]
		
		if (!!user_image) {
			const base64Data = user_image.replace(user_image.match(/^data:(image\/(jpeg|jpg|webp|png));base64,/)[0], '');
			const fileBuffer = Buffer.from(base64Data, 'base64');
			const encryptedFile = encryptImage(fileBuffer, encryptionKey, encryptionIv)
			sql = "UPDATE users SET username = ?, account_type = ?, user_image = ? WHERE id = ?;"
			parameters = [username, encryptedAccountType, encryptedFile, user_id]
		}

		queryDatabase(sql, parameters)
		.then(() => {
			res.json({ status: "success", message: "User updated successfully. Reload to see changes." })
		})
		.catch(err => {
			res.status(500).json({ status: "fail", message: err })
		})
	})
})

if (process.env.NODE_ENV !== "test") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = app;