import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";
import { useNavigate } from "react-router-dom";

function ResetPasswordPage() {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(10);
    const { addError } = useError();
    const navigate = useNavigate();

    useEffect(() => {
        const resetId = window.location.pathname.split("/")[3];
        axios.post(`http://127.0.0.1:3000/api/verify/${resetId}`)
        .then(resp => {
            if (resp.data.status === "success") {
                setVerified(true);
            }
        })
        .catch(err => {
            if (err.response.status === 400) {
                addError(err.response.data.message)
                setError(err.response.data.message);

                const intervalId = setInterval(() => {
                    setTimer((prevTimer) => {
                        if (prevTimer === 1) {
                            clearInterval(intervalId);
                            navigate("/");
                        }
                        return prevTimer - 1;
                    });
                }, 1000);
        
                return () => clearInterval(intervalId);
            }
            console.error(err)
        })
    }, [])

    if (!verified) {
        return (
            <div className="reset-password reset-password-page-fail">
                <p>{error}</p>

                <p>You will be redirected to the login page in {timer} seconds</p>
            </div>
        );
    } else {
        return <div>ResetPasswordPage</div>;
    }
}

export default ResetPasswordPage;