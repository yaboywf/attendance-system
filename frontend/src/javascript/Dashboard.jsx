import React, { useState, useEffect } from "react";
import axios from "axios";
import { ErrorStack } from "./Errors";

function DashboardPage() {
    const [user, setUser] = useState(null);
    const [errors, setErrors] = useState([]);

    const addError = (message) => {
        const id = Date.now();
        setErrors((prev) => [...prev, { id, message }]);

        if (process.env.NODE_ENV !== "test") {
            setTimeout(() => {
                setErrors((prev) => prev.filter((error) => error.id !== id));
            }, 3000);   
        }
    };

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_credentials")
        .then((res) => {
            if (res.data.status === "success") {
                setUser(res.data.user);
            }
        })
        .catch((err) => {
            if (err.response?.data?.status === "fail" || err.response?.status === 401) {
                window.location.href = "/";
            } else {
                addError("Something went wrong");
                console.error(err.response);
            }
        });
    }, []);

    return (
        <div className="dashboard-page">
            <ErrorStack errors={errors} />

            <h1>Hello, {user?.username || "User"}</h1>

            <section>
                graphs
            </section>

            <section>
                <h2>Pending Tasks</h2>

                <div>
                    list of pending tasks
                </div>
            </section>

            <p>Made by Dylan Yeo</p>
        </div>
    );
}

export default DashboardPage;
