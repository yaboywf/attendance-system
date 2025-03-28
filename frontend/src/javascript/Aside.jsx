import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types'
import axios from "axios";
import { useError } from "./ErrorContext";

function Aside({ user }) {
    const [page, setPage] = useState("dashboard");
    const { addError } = useError()
    const [userImage, setUserImage] = useState(null)

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_user_image", { withCredentials: true, responseType: 'blob' })
        .then(resp => {
            const imageUrl = URL.createObjectURL(resp.data);
            setUserImage(imageUrl);
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch user's profile picture")
            console.error(err)
        })
    }, [])

    useEffect(() => {
        const path = window.location.pathname;
        const new_path = path.replace("/", "").replace("_", "");
        setPage(new_path);
    }, []);

    const logout = () => {
        axios.put("http://127.0.0.1:3000/api/logout", {}, { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                window.location.href = "/"
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to logout")
            console.error(err)
        })
    }

    const goToPage = (page) => {
        window.location.href = page;
    }

    return (
        user?.user?.username && <aside>
            <section>
                <div>
                    <img src="attendance-logo.webp" alt="Logo" />
                    <h1>AttendEase</h1>
                </div>
                
                <div>
                    <button data-active={page === "dashboard"} onClick={() => goToPage("/dashboard") }>
                        <i className="fa-solid fa-house"></i>
                        Home
                    </button>
                    
                    {user?.user?.account_type?.toLowerCase() === "student" && <>
                    <button data-active={page === "forms"} onClick={() => goToPage("/forms") }>
                        <i className="fa-solid fa-file"></i>
                        Submit MC / LOA
                    </button>
                    <button data-active={page === "attendance"} onClick={() => goToPage("/attendance") }>
                        <i className="fa-solid fa-check"></i>
                        Mark Attendance
                    </button>
                    <button data-active={page === "myattendance"} onClick={() => goToPage("/my_attendance") }>
                        <i className="fa-solid fa-clipboard-user"></i>
                        My Attendance
                    </button>
                    <button data-active={page === "myforms"} onClick={() => goToPage("/my_forms") }>
                        <i className="fa-solid fa-file-invoice"></i>
                        My MC / LOA
                    </button>
                    </>}
                    
                    {user?.user?.account_type?.toLowerCase() === "lecturer" && <>
                        <button data-active={page === "usermanagement"} onClick={() => goToPage("/user_management") }>
                            <i className="fa-solid fa-users"></i>
                            User Management
                        </button>
                        <button data-active={page === "studentattendance"} onClick={() => goToPage("/student_attendance") }>
                            <i className="fa-solid fa-clipboard-user"></i>
                            Student Attendance
                        </button>
                        <button data-active={page === "approve"} onClick={() => goToPage("/approve") }>
                            <i className="fa-solid fa-file-invoice"></i>
                            Approve MC / LOA
                        </button>
                    </>}
                    
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
                <img src={userImage} alt="User Image" />
                <p>{user?.user?.username || "User"}</p>
            </section>
        </aside>
    )
}

Aside.PropTypes = {
    user: PropTypes.object.isRequired
}

export { Aside }