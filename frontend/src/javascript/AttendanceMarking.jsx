import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";

function AttendanceMarking() {
    const { user } = useOutletContext();
    const [location, setLocation] = useState(null);
    const [ip, setIp] = useState(null);
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [face, setFace] = useState(null);
    const { addError } = useError();
    const [criterias, setCriterias] = useState({ ip: false, time: false, location: false, face: false });

    useEffect(() => {
        const updateClock = () => {
            const newTime = new Date().toLocaleTimeString();
            setTime(newTime);
        };
    
        const intervalId = setInterval(updateClock, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setLocation({ latitude, longitude });
                },
                (err) => {
                    console.error("Error getting location: " + err.message);
                }
            );
        } else {
            addError("Cannot get device location")
        }
    }, [])

    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
        .then((response) => response.json())
        .then((data) => setIp(data.ip))
        .catch((err) => console.error('Error fetching public IP:', err));
    }, []);

    const submit = () => {
        axios.post("http://127.0.0.1:3000/api/mark_attendance/time", { time: time }, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(resp => {
            console.log(resp)

            if (resp.data.status === "success") {
                setCriterias({ ...criterias, time: true });
            }
        })
        .catch(() => addError("Something went wrong when submitting"));

        axios.post("http://127.0.0.1:3000/api/mark_attendance/ip", { ip: ip }, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(resp => {
            console.log(resp)

            if (resp.data.status === "success") {
                setCriterias({ ...criterias, ip: true });
            }
        })
        .catch(() => addError("Something went wrong when submitting"));

        axios.post("http://127.0.0.1:3000/api/mark_attendance/location", { location: location }, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(resp => {
            console.log(resp)

            if (resp.data.status === "success") {
                setCriterias({ ...criterias, location: true });
            }
        })
        .catch(() => addError("Something went wrong when submitting"));

        axios.post("http://127.0.0.1:3000/api/mark_attendance/face", { face: face }, {
            headers: {
                "Content-Type": "application/json",
            },
        })
        .then(resp => {
            console.log(resp)

            if (resp.data.status === "success") {
                setCriterias({ ...criterias, face: true });
            }
        })
        .catch(() => addError("Something went wrong when submitting"));
    };
    
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
                <button onClick={submit}>
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