import React, { useState, useEffect } from "react";
import { useError } from "./ErrorContext";
import axios from 'axios'
import { useOutletContext } from 'react-router-dom';

function StudentAttendance() {
    const { addError } = useError()
    const { user } = useOutletContext();
    const [attendances, setAttendances] = useState([]);
    const [overlay, setOverlay] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

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
    
    const selectAttendance = (e) => {
        const attendance = e.target.getAttribute("data-id");
        const attendanceData = attendances.find(item => item.id == attendance);
        setSelectedAttendance(attendanceData);
        setOverlay(true);
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        const attendanceId = selectedAttendance.id;
        const status = e.target.status.value;
        const remarks = e.target.remarks.value;
        const iv = selectedAttendance.iv

        axios.put(`http://127.0.0.1:3000/api/update_attendance/${attendanceId}`, { status, remarks, iv }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                addError("Attendance Updated. Reload to see changes.", "success")
                setOverlay(false);
                setSelectedAttendance(null);
            }
        })
        .catch(err => {
            console.error(err);
            addError("Something went wrong when trying to update attendance")
        })
    }

    const handleDelete = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete this user?");

        if (isConfirmed) {
            const attendanceId = selectedAttendance.id

            axios.delete(`http://127.0.0.1:3000/api/delete_attendance/${attendanceId}`, { headers: { "Content-Type": "application/json" }, withCredentials: true })
            .then(resp => {
                if (resp.data.status === "success") {
                    addError("Attendance Deleted. Reload to see changes.", "success")
                    setOverlay(false);
                    setSelectedAttendance(null);
                }
            })
            .catch(err => {
                console.error(err);
                addError("Something went wrong when trying to delete attendance")
            })
        }
    }

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
                        <p>{index + 1}</p>
                        <p>{attendance?.username}</p>
                        <p>{attendance?.attendance_datetime}</p>
                        <p>{attendance?.updated_datetime}</p>
                        <p>{attendance?.status}</p>
                        <p>
                            <i className="fa-solid fa-edit" data-id={attendance?.id} onClick={(e) => selectAttendance(e) }></i>
                        </p>
                    </div>
                ))}
            </section>

            {overlay && <div className="overlay">
                <form onSubmit={handleSubmit} noValidate>
                    <i className="fa-solid fa-xmark" onClick={() => { setOverlay(false); setSelectedAttendance(null); }}></i>
                    <h2>Update Attendance</h2>

                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" id="username" placeholder="Enter Username" autoComplete="off" disabled defaultValue={selectedAttendance?.username} />

                    <label htmlFor="date">Date:</label>
                    <input type="date" name="date" id="date" defaultValue={selectedAttendance?.attendance_datetime.split(" ")[0].split("-").reverse().join("-")} disabled />

                    <label htmlFor="attendance-status">Attendance Status:</label>
                    <select name="status" id="attendance-status" defaultValue={selectedAttendance?.status}>
                        <option value="1">Present (1)</option>
                        <option value="0">Absent (0)</option>
                        <option value="E">Excused (E)</option>
                        <option value="S">Sick (S)</option>
                    </select>

                    <label htmlFor="remarks">Remarks:</label>
                    <textarea name="remarks" id="remarks" placeholder="Enter Remarks (Optional)" defaultValue={selectedAttendance?.remarks}></textarea>

                    <div>
                        <button type="submit">Update</button>
                        <button type="button" onClick={handleDelete}>Delete</button>
                    </div>
                </form>
            </div>}
        </div>
    )
}

export default StudentAttendance