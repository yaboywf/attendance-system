import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";

function MyAttendance() {
    const { addError } = useError()
    const [attendance, setAttendance] = useState([]);
    const [forms, setForms] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_attendance", { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                setAttendance(resp.data.data)

                axios.get("http://127.0.0.1:3000/api/get_forms", { withCredentials: true })
                .then(resp1 => {
                    console.log(resp1.data)
                    if (resp1.data.status === "success") {
                        setForms(resp1.data.data)
                    }
                })
                .catch(err => {
                    addError("Something went wrong when trying to fetch forms")
                    console.error(err)
                })
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch user's attendance")
            console.error(err)
        })
    }, [])

    const getForm = (date) => {
        forms.forEach(form => {
            date = new Date(date)
            const startDate = new Date(form.start_date);
            const endDate = new Date(form.end_date);

            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            if (date >= startDate && date <= endDate) {
                return form.status
            }
        })
    }

    return (
        <div className="myattendance">
            <h1>My Attendance</h1>

            <section>
                <p>No.</p>
                <p>Date</p>
                <p>Status</p>
                <p>MC / LOA</p>
                <p>Remarks</p>

                {attendance.map((item, index) => 
                    <div key={index} className="attendance-item">
                        <p>{index + 1}</p>
                        <p>{item.attendance_datetime}</p>
                        <p>{item.status}</p>
                        <p>{item.status == "E" || item.status == "S" ? getForm(item.attendance_datetime) : "-" }</p>
                        <p>{item.remarks === "" ? "-" : item.remarks}</p>
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyAttendance;