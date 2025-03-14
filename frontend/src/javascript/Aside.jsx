import React, { useState, useEffect } from "react";

function Aside() {
    const [page, setPage] = useState("home");

    useEffect(() => {
        const path = window.location.pathname;
        if (path === "/") {
            setPage("home");
        } else if (path === "/submit") {
            setPage("submit");
        } else if (path === "/mark") {
            setPage("mark");
        } else if (path === "/help") {
            setPage("help");
        }
    }, []);

    return (
        <aside>
            <section>
                <div>
                    <img src="attendance-logo.webp" alt="Logo" />
                    <h1>AttendEase</h1>
                </div>
                
                <div>
                    <button data-active={page === "home"}>
                        <i className="fa-solid fa-house"></i>
                        Home
                    </button>
                    <button data-active={page === "submit"}>
                        <i className="fa-solid fa-file"></i>
                        Submit MC / LOA
                    </button>
                    <button data-active={page === "mark"}>
                        <i className="fa-solid fa-check"></i>
                        Mark Attendance
                    </button>
                    <button data-active={page === "help"}>
                        <i className="fa-solid fa-question"></i>
                        Help
                    </button>
                    <button>
                        <i className="fa-solid fa-user"></i>
                        Profile
                    </button>
                    <button>
                        <i className="fa-solid fa-lock"></i>
                        Logout
                    </button>
                </div>
            </section>
            
            <section>
                <img src="attendance-logo.webp" alt="User Image" />
                <p>Username</p>
            </section>
        </aside>
    )
}

export { Aside }