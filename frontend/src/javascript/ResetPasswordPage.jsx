import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";

function ResetPasswordPage() {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(10);
    const { addError } = useError();

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
                            window.location.href = "/";
                        }
                        return prevTimer - 1;
                    });
                }, 1000);
        
                return () => clearInterval(intervalId);
            }
            console.error(err)
        })
    }, [])

    const changeVisibility = (e) => {
        const input = e.target.previousElementSibling;
        if (input.type === "password") {
            input.type = "text";
            e.target.classList.remove("fa-eye");
            e.target.classList.add("fa-eye-slash");
        } else {
            input.type = "password";
            e.target.classList.remove("fa-eye-slash");
            e.target.classList.add("fa-eye");
        }
    }

    if (!verified) {
        return (
            <div className="reset-password reset-password-page-fail">
                <p>{error}</p>

                <p>You will be redirected to the login page in {timer} seconds</p>
            </div>
        );
    } else {
        return (
            <div className="reset-password reset-password-page-success">
                <form>
                    <label htmlFor="new">New Password:</label>
                    <input type="password" name="new" id="new" placeholder="Enter New Password" autoComplete="new-password" />
                    <i className="fa-solid fa-eye" onClick={changeVisibility}></i>

                    <label htmlFor="confirm">Confirm New Password:</label>
                    <input type="password" name="confirm" id="confirm" placeholder="Confirm New Password" autoComplete="new-password" />
                    <i className="fa-solid fa-eye" onClick={changeVisibility}></i>

                    <button type="submit">Submit</button>
                </form>
            </div>
        );
    }
}

export default ResetPasswordPage;