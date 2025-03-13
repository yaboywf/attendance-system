const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("./database");
const { type } = require("os");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use(
	session({
		secret: "attendEase",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

passport.use(
	new LocalStrategy(async (username, password, done) => {
		const users = await db("SELECT * FROM USERS")

		if (users.length === 0) return done(null, false, { message: "No users in database" });

		const user = users.find(user => user.username === username);

		if (!user) return done(null, false, { message: "User not found" });
		if (user.password !== password) return done(null, false, { message: "Incorrect password" });

		return done(null, user);
	})
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
	const user = Object.values(db("SELECT * FROM USERS")).find((u) => u.id === id);
	done(null, user);
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
	res.json({ status: "fail" })
}

app.get("/dashboard", isAuthenticated, (req, res) => {
	res.send(`Welcome ${req.user.username}, you are logged in!`);
});

app.get("/login-fail", (req, res) => {
	res.send("Login failed. Please check your credentials.");
});


if (process.env.NODE_ENV !== "test") {
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = app;