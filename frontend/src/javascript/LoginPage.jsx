import React, { useState } from "react";

function LoginPage() {
    const [formType, setFormType] = useState("login");

    return (
        <div className="login-page">
            {formType === "login" && <section>
                <div>
                    <h2>Hello, Welcome to AttendEase</h2>
                    <p>Lets get you logged in!</p>
                </div>

                <form action="">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" autoComplete="username" required placeholder="Enter your username" />

                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" autoComplete="current-password" required placeholder="Enter your password" />

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
