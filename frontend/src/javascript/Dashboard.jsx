import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';
import axios from "axios";

function DashboardPage() {
    const { user } = useOutletContext();
    const [attendances, setAttendances] = useState({});
    const [forms, setForms] = useState(0);
    const [overallAttendance, setOverallAttendance] = useState({ "expected": 0, "received": 0});

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                let uniqueAttendances = {}

                const totalAttendance = await axios.get("http://127.0.0.1:3000/api/get_all_attendance", { withCredentials: true })
                if (totalAttendance.data.status === "success") {
                    totalAttendance.data.data.forEach(attendance => {
                        const date = attendance.attendance_datetime.split("T")[0]
                        if (!uniqueAttendances[date]) uniqueAttendances[date] = false
                    })
                }

                const userAttendance = await axios.get("http://127.0.0.1:3000/api/get_attendance", { withCredentials: true })
                if (userAttendance.data.status === "success") {
                    userAttendance.data.data.forEach(attendance => {
                        const date = attendance.attendance_datetime.split("T")[0]
                        uniqueAttendances[date] = true
                    })
                }

                const remainingAttendance = Object.entries(uniqueAttendances).filter(([, value]) => value === false).reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {});
                const userForms = await axios.get("http://127.0.0.1:3000/api/get_user_attendance", { withCredentials: true })
                if (userForms.data.status === "success") {
                    setForms(userForms.data.data.length)
                    if (!remainingAttendance.length === 0) {
                        remainingAttendance.forEach((date,) => {
                            const attendanceDate = new Date(date);
                            userForms.data.data.forEach(form => {
                                const startDate = new Date(form.start_date);
                                const endDate = new Date(form.end_date);

                                if (attendanceDate >= startDate && attendanceDate <= endDate && form.status.toLowerCase() === "approved") {
                                    uniqueAttendances[date] = true
                                }
                            })
                        })
                    }
                }

                setAttendances(uniqueAttendances)
            } catch (err) {
                console.error(err)
            }
        }

        const fetchAttendance1 = async () => {
            try {
                let uniqueAttendances = {}

                const totalAttendance = await axios.get("http://127.0.0.1:3000/api/get_all_attendance", { withCredentials: true })
                if (totalAttendance.data.status === "success") {
                    totalAttendance.data.data.forEach(attendance => {
                        const date = attendance.attendance_datetime.split("T")[0]
                        if (!uniqueAttendances[date]) uniqueAttendances[date] = false
                    })
                }

                const users = await axios.get("http://127.0.0.1:3000/api/get_users_simplified", { withCredentials: true })
                const students = Object.entries(users.data.data).filter(([, value]) => value.account_type.toLowerCase() === "student").length;
                setOverallAttendance({ "expected": totalAttendance.data.data.length, "received": students * Object.keys(uniqueAttendances).length })
            } catch (err) {
                console.error(err)
            }
        }

        user?.account_type === "lecturer" ? fetchAttendance1() : fetchAttendance()
    }, []);

    return (
        <div className="dashboard-page">
            <h1>Hello, {user?.username || "User"}</h1>

            <section>
                {user?.account_type === "student" && <>
                <div className="graph">
                    <div className="ring"></div>
                    <div className="ring progress" style={{ background: `conic-gradient(black 0% ${Object.values(attendances).filter(value => value === true).length / Object.keys(attendances).length * 50}%, transparent ${Object.values(attendances).filter(value => value === true).length / Object.keys(attendances).length * 50}% 100%)` }}></div>
                    <div className="ring cover">
                        <span>{Object.values(attendances).filter(value => value === true).length / Object.keys(attendances).length * 100}%</span>
                    </div>
                    <p>Your Attendance Rate</p>
                </div>

                <div className="graph">
                    <div className="ring"></div>
                    <div className="ring progress" style={{ background: `conic-gradient(black 0% ${(forms > 8 ? 8 : forms) / 8 * 50}%, transparent ${(forms > 8 ? 8 : forms) / 8 * 50}% 100%)` }}></div>
                    <div className="ring cover">
                        <span>{forms} / 8</span>
                    </div>

                    <p>Forms Submitted</p>
                </div>
                </>}

                {user?.account_type !== "student" && <div className="graph">
                    <div className="ring"></div>
                    <div className="ring progress" style={{ background: `conic-gradient(black 0% ${overallAttendance.expected / overallAttendance.received * 50}%, transparent ${overallAttendance.expected / overallAttendance.received * 50}% 100%)` }}></div>
                    <div className="ring cover">
                        <span>{overallAttendance.expected / overallAttendance.received * 100}%</span>
                    </div>
                    <p>Overall Attendance Rate</p>
                </div>}
            </section>
        </div>
    );
}

export default DashboardPage;
