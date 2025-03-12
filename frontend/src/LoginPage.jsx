import React from "react";

function LoginPage() {
    return (
        <div>
            <form action="">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
