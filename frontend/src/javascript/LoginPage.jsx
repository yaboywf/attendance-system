import React, { useState } from "react";
import axios from "axios";
import { ErrorStack } from "./Errors";

function LoginPage() {
    const [formType, setFormType] = useState("login");
    const [errors, setErrors] = useState([]);

    const addError = (message) => {
        const id = Date.now();
        setErrors((prev) => [...prev, { id, message }]);

        setTimeout(() => {
            setErrors((prev) => prev.filter((error) => error.id !== id));
        }, 3000);
    };

    const Login = (e) => {
        e.preventDefault();

        const username = e.target.username.value;
        const password = e.target.password.value;

        if (!username) e.target.username.nextElementSibling.style.display = "block";
        if (!password) e.target.password.nextElementSibling.style.display = "block";
        if (!username || !password) return;

        axios.post("http://127.0.0.1:3000/login", { username, password })
        .then(res => {
            if (res.data.status === "success") {
                window.location.href = "/dashboard";
            }
        })
        .catch(err => {
            if (err.response?.data?.status === "fail" || err.response?.status === 401) {
                addError("Incorrect username or password");
            } else {
                addError("Something went wrong");
                console.error(err.response);
            }
        });
    }

    return (
        <div className="login-page">
            <ErrorStack errors={errors} />

            {formType === "login" && <section>
                <div>
                    <h2>Hello, Welcome to AttendEase</h2>
                    <p>Lets get you logged in!</p>
                </div>

                <form onSubmit={(e) => Login(e)} noValidate>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" autoComplete="username" required placeholder="Enter your username" />
                    <p className="error">Username is required</p>

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" autoComplete="current-password" required placeholder="Enter your password" />
                    <p className="error">Password is required</p>

                    <button type="submit">Login</button>

                    <button type="button" onClick={() => setFormType("reset")}>I&apos;ve forgotten my password</button>
                </form>
            </section>}

            {formType === "reset" && <section>
                <div>
                    <button onClick={() => setFormType("login")}>
                        <i className="fa-solid fa-arrow-left"></i>
                        I remember my password now!
                    </button>
                    <h2>Forgotten Your Password?</h2>
                    <p>Fear not! We got that covered too!</p>
                </div>

                <form action="">
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" name="email" autoComplete="email" required placeholder="Enter your email" />

                    <button type="submit">Reset Password</button>
                </form>
            </section>}
        </div>
    );
}

export default LoginPage;
