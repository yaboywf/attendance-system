import React, { useState, useEffect } from "react";
import { useError } from "./ErrorContext";
import axios from 'axios'
import { useOutletContext } from 'react-router-dom';

function StudentAttendance() {
    const { addError } = useError()
    const { user } = useOutletContext();
    const [attendances, setAttendances] = useState([])

    if (user?.account_type?.toLowerCase() !== "lecturer") {
        window.location.href = "/dashboard";
    }

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_all_attendance", { headers: { "Content-Type": "application/json" }, withCredentials: true })
        .then(resp => {
            console.log(resp.data)
            if (resp.data.status === "success") {
                resp.data.data.forEach(row => {
                    row.attendance_datetime = formatDate(row.attendance_datetime);
                    row.updated_datetime = formatDate(row.updated_datetime);
                })
                setAttendances(resp.data.data)
            }
        })
        .catch(err => {
            console.error(err);
            addError("Something went wrong when trying to get users' attendance")
        })
    }, [])

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const formattedDate = date.toLocaleString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    
        return formattedDate.replace(',', '').replace(/\//g, '-').replace(/\s+/g, ' ');
    };

    const filter = (e) => {
        const search = e.target.value.toLowerCase();
    
        document.querySelectorAll(".row").forEach(row => {
            const cells = row.querySelectorAll("p");
            let showRow = false;
    
            cells.forEach(cell => {
                if (cell.textContent.toLowerCase().includes(search)) {
                    showRow = true;
                }
            });
    
            row.style.display = showRow ? "contents" : "none";
        });
    };
    

    return (
        <div className="student-attendance">
            <h1>Students&apos; Attendance</h1>

            <section>
                <label htmlFor="search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Search:
                </label>
                <input type="search" name="search" id="search" placeholder="Search a row" autoComplete="off" onInput={(e) => filter(e)} />
            </section>

            <section>
                <p>No.</p>
                <p>Username</p>
                <p>Submitted at</p>
                <p>Last Updated</p>
                <p>Status</p>
                <p>Edit</p>

                {attendances?.map((attendance, index) => (
                    <div key={index} className="row">
                        <p>{index}</p>
                        <p>{attendance?.username}</p>
                        <p>{attendance?.attendance_datetime}</p>
                        <p>{attendance?.updated_datetime}</p>
                        <p>{attendance?.status}</p>
                        <p>
                            <i className="fa-solid fa-edit"></i>
                        </p>
                    </div>
                ))}
            </section>
        </div>
    )
}

export default StudentAttendance