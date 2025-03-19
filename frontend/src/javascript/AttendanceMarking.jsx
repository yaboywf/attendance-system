import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';

function AttendanceMarking() {
    const { user } = useOutletContext();
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const updateClock = () => {
            const newTime = new Date().toLocaleTimeString();
            setTime(newTime);
        };
    
        const intervalId = setInterval(updateClock, 1000);
        return () => clearInterval(intervalId);
    }, []);
    
    return (
        <div className="attendance-marking">
            <h1>Mark Attendance</h1>

            <section>
                <p>Name:</p>
                <p>{ user?.username || "User" }</p>

                <p>Date:</p>
                <p>{new Date().toDateString()}</p>

                <p>Time:</p>
                <p>{time}</p>
            </section>

            <section>
                <div className="ring1"></div>
                <div className="ring2 ring1"></div>
                <div className="ring3 ring1"></div>
                <button>
                    <i className="fa-solid fa-check"></i>
                    <p>Mark Attendance</p>
                </button>
            </section>

            <section>
                <div>
                    <p>Criteria</p>
                    <p>Status</p>

                    <p>Location</p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>

                    <p>Network</p>
                    <p>
                        <i className="fa-solid fa-check"></i>
                    </p>

                    <p>Face Recognition</p>
                    <p>
                        <i className="fa-solid fa-spinner-third"></i>
                    </p>

                    <p>Others</p>
                    <p>
                        <i className="fa-solid fa-xmark"></i>
                    </p>
                </div>
            </section>
        </div>
    )
}

export default AttendanceMarking