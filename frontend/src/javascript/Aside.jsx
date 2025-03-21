import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types'

function Aside({ user }) {
    const [page, setPage] = useState("home");

    useEffect(() => {
        const path = window.location.pathname;
        if (path === "/dashboard") {
            setPage("home");
        } else if (path === "/forms") {
            setPage("submit");
        } else if (path === "/attendance") {
            setPage("attendance");
        } else if (path === "/help") {
            setPage("help");
        } else if (path === "/profile") {
            setPage("profile");
        }
    }, []);

    const logout = () => {
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "/"
    }

    const goToPage = (page) => {
        window.location.href = page;
    }

    return (
        <aside>
            <section>
                <div>
                    <img src="attendance-logo.webp" alt="Logo" />
                    <h1>AttendEase</h1>
                </div>
                
                <div>
                    <button data-active={page === "home"} onClick={() => goToPage("/dashboard") }>
                        <i className="fa-solid fa-house"></i>
                        Home
                    </button>
                    <button data-active={page === "submit"} onClick={() => goToPage("/forms") }>
                        <i className="fa-solid fa-file"></i>
                        Submit MC / LOA
                    </button>
                    <button data-active={page === "attendance"} onClick={() => goToPage("/attendance") }>
                        <i className="fa-solid fa-check"></i>
                        Mark Attendance
                    </button>
                    <button data-active={page === "help"} onClick={() => goToPage("/help") }>
                        <i className="fa-solid fa-question"></i>
                        Help
                    </button>
                    <button data-active={page === "profile"} onClick={() => goToPage("/profile") }>
                        <i className="fa-solid fa-user"></i>
                        My Profile
                    </button>
                    <button onClick={() => logout() }>
                        <i className="fa-solid fa-lock"></i>
                        Logout
                    </button>
                </div>
            </section>
            
            <section>
                <img src="attendance-logo.webp" alt="User Image" />
                <p>{user?.user?.username || "User"}</p>
            </section>
        </aside>
    )
}

Aside.PropTypes = {
    user: PropTypes.object.isRequired
}

export { Aside }