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

                <p>Forget Password? <a href="">Click here to reset</a></p>
            </form>
        </div>
    );
}

export default LoginPage;
