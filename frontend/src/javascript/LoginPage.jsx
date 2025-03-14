import React, { useState } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";

function LoginPage() {
    const [formType, setFormType] = useState("login");
    const { addError } = useError();

    const Login = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get("username");
        const password = formData.get("password");

        if (!username) document.querySelector("#username + .error").style.display = "block";
        if (!password) document.querySelector("#password + .error").style.display = "block";
        
        if (username && password) {
            axios.post("http://127.0.0.1:3000/api/authenticate", { username, password }, { withCredentials: true })
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
    }

    return (
        <div className="login-page">
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
