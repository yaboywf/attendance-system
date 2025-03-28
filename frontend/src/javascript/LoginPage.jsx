import React, { useState } from "react";
import { useError } from "./ErrorContext";
import axios from "axios";

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
            fetch("http://127.0.0.1:3000/api/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                }),
                credentials: "include"
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        console.log(error);
                        throw new Error(error.error);
                    })
                }

                return response.json();
            })
            .then(data => {
                if (data.status === "success") {
                    window.location.href = "/dashboard";
                }
            })
            .catch(err => {
                addError("Incorrect username or password");
                console.error(err);
            });
        }
    }

    const ResetPassword = (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const email = formData.get("email");

        axios.post("http://127.0.0.1:3000/api/forget_password", { email }, { headers: { "Content-Type": "application/json" } })
        .then(resp => {
            if (resp.status == 200) {
                addError("Password reset email sent", "success")
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to reset your password");
            console.error(err);
        })
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
                    <h2>Forgotten Your Password?</h2>
                    <p>Fear not! We got that covered too!</p>
                </div>

                <form onSubmit={(e) => ResetPassword(e)}>
                    <label htmlFor="email">Email:</label>
                    <input type="text" id="email" name="email" autoComplete="email" required placeholder="Enter your email" />

                    <button type="submit">Reset Password</button>
                    <button type="button" onClick={() => setFormType("login")}>I remember my password now!</button>
                </form>
            </section>}
        </div>
    );
}

export default LoginPage;
