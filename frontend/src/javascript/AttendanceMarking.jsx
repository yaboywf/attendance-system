import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";
import axios from "axios";

function AttendanceMarking() {
    const { user } = useOutletContext();
    const [location, setLocation] = useState(null);
    const [ip, setIp] = useState(null);
    const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'));
    const { addError } = useError();
    const [showReadyToSubmit, setShowReadyToSubmit] = useState(false);
    const [icons, setIcons] = useState({ ip: "fa-solid fa-xmark", time: "fa-solid fa-xmark", location: "fa-solid fa-xmark", face: "fa-solid fa-xmark" });

    useEffect(() => {
        const updateClock = () => {
            const newTime = new Date().toLocaleTimeString('en-GB');
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
                    setLocation({ latitude: 1.3189813330880622, longitude: 103.88449805545397 })
                },
                (error) => {
                    console.error("Error getting location: " + error.message);
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            addError("Permission to access location was denied.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            addError("Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            addError("The request to get user location timed out.");
                            break;
                        case error.UNKNOWN_ERROR:
                            addError("An unknown error occurred.");
                            break;
                    }
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
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

    useEffect(() => {
        if (icons.time === "fa-solid fa-check" && icons.ip === "fa-solid fa-check" && icons.location === "fa-solid fa-check" && icons.face === "fa-solid fa-check") {
            setShowReadyToSubmit(true);
        }
    }, [icons])

    const checks = async () => {
        try {
            setIcons({ ip: "fa-solid fa-spinner-third", time: "fa-solid fa-spinner-third", location: "fa-solid fa-spinner-third", face: "fa-solid fa-spinner-third"})

            const timeResp = await axios.post("http://127.0.0.1:3000/api/mark_attendance/time", {}, { headers: { "Content-Type": "application/json" }, withCredentials: true });
            setIcons(prevIcons => ({
                ...prevIcons,
                time: timeResp.data.status === "success" ? "fa-solid fa-check" : "fa-solid fa-xmark", 
            }));

            const ipResp = await axios.post("http://127.0.0.1:3000/api/mark_attendance/ip", { ip }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
            setIcons(prevIcons => ({
                ...prevIcons,
                ip: ipResp.data.status === "success" ? "fa-solid fa-check" : "fa-solid fa-xmark", 
            }));

            const locationResp = await axios.post("http://127.0.0.1:3000/api/mark_attendance/location", { latitude: location.latitude, longitude: location.longitude }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
            setIcons(prevIcons => ({
                ...prevIcons,
                location: locationResp.data.status === "success" ? "fa-solid fa-check" : "fa-solid fa-xmark", 
            }));
        
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const video = document.createElement('video');
            video.srcObject = stream;

            await new Promise((resolve) => {
                video.onloadedmetadata = resolve;
                video.play();
            });

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            if (video.paused || video.ended) {
                console.error('Video is not playing properly');
                return;
            }

            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            stream.getTracks().forEach(track => track.stop());
            const imageData = canvas.toDataURL('image/jpeg');
        
            const faceResp = await axios.post("http://127.0.0.1:3000/api/mark_attendance/face", { image: imageData }, { headers: { "Content-Type": "application/json" }, withCredentials: true });
            setIcons(prevIcons => ({
                ...prevIcons,
                face: faceResp.data.status === "success" ? "fa-solid fa-check" : "fa-solid fa-xmark"
            }));
        } catch (error) {
            console.error("Camera access failed:", error);
        }        
    };

    const reset = () => {
        setShowReadyToSubmit(false)
        setIcons({ ip: "fa-solid fa-xmark", time: "fa-solid fa-xmark", location: "fa-solid fa-xmark", face: "fa-solid fa-xmark" })
    }

    const submit = () => {
        if (["ip", "location", "time", "face"].every(check => icons[check] === "fa-solid fa-check")) {
            axios.post("http://127.0.0.1:3000/api/mark_attendance/submit", {}, { withCredentials: true })
            .then(resp => {
                if (resp.data.status === "success") {
                    console.log("attendance marked")
                    setShowReadyToSubmit(false)
                    window.location.href = "/dashboard"
                }
            })
            .catch(error => {
                addError("Something went wrong when trying to submit your attendance")
                console.error(error)
            })
        }
    }
    
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
                <button onClick={checks}>
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
                        <i className={icons.location}></i>
                    </p>

                    <p>Network</p>
                    <p>
                        <i className={icons.ip}></i>
                    </p>

                    <p>Face Recognition</p>
                    <p>
                        <i className={icons.face}></i>
                    </p>

                    <p>Others</p>
                    <p>
                        <i className={icons.time}></i>
                    </p>
                </div>
            </section>


            {showReadyToSubmit && <div className="ready_to_submit">
                <div>
                    <i className="fa-solid fa-list-check"></i>
                    <h1>Ready to Submit</h1>
                    <p>All checks have been completed</p>
                    <p>If you cancel, all checks will be reset and your attendance will not be marked</p>

                    <div>
                        <button onClick={submit}>Submit</button>
                        <button onClick={reset}>Cancel</button>
                    </div>
                </div>
            </div>}
        </div>
    )
}

export default AttendanceMarking