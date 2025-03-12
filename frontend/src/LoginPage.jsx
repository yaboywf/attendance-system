import React, { useEffect, useState } from "react";
import axios from "axios";

function LoginPage() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:3001/api/hello")
            .then(response => setMessage(response.data.message))
            .catch(error => console.error("Error fetching data:", error));
    }, []);

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
