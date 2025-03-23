import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";

function ResetPasswordPage() {
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(10);
    const { addError } = useError();
    const [userId, setUserId] = useState(null);
    const [passwordCriterias, setPasswordCriterias] = useState({ uppercase: false, lowercase: false, numbers: false, special: false, length: false })
    const [visibility, setVisibility] = useState({ new: false, confirm: false });

    useEffect(() => {
        const resetId = window.location.pathname.split("/")[3];
        axios.post(`http://127.0.0.1:3000/api/verify/${resetId}`)
        .then(resp => {
            if (resp.data.status === "success") {
                setVerified(true);
                setUserId(resp.data.user_id);
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

    const toggleVisibility = (field) => {
        setVisibility((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (e.target.new.value === "") return addError("Password cannot be empty");
        if (!passwordCriterias.uppercase || !passwordCriterias.lowercase || !passwordCriterias.numbers || !passwordCriterias.special || !passwordCriterias.length) return addError("Password does not meet requirements");
        if (e.target.new.value !== e.target.confirm.value) return addError("Passwords do not match");

        axios.put("http://127.0.0.1:3000/api/reset_password", { user_id: userId, password: e.target.new.value, confirm: e.target.confirm.value }, { headers: { "Content-Type": "application/json" } })
        .then(resp => {
            if (resp.data.status === "success") {
                addError("Password Updated. You will be redirected shortly", "success")
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000)
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to update your password");
            console.error(err);
        })
    }

    const check = (newPassword) => {
        setPasswordCriterias({
            ...passwordCriterias,
            uppercase: /[A-Z]/.test(newPassword),
            lowercase: /[a-z]/.test(newPassword),
            numbers: /\d/.test(newPassword),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
            length: newPassword.length >= 8
        });
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
                <form onSubmit={handleSubmit}>
                    <label htmlFor="new">New Password:</label>
                    <input type={visibility.new ? "text" : "password"} name="new" id="new" placeholder="Enter New Password" autoComplete="new-password" onChange={e => check(e.target.value)} />
                    <i className={`fa-solid ${visibility.new ? "fa-eye-slash" : "fa-eye"}`} onClick={() => toggleVisibility('new')}></i>

                    <label htmlFor="confirm">Confirm New Password:</label>
                    <input type={visibility.confirm ? "text" : "password"} name="confirm" id="confirm" placeholder="Confirm New Password" autoComplete="new-password" />
                    <i className={`fa-solid ${visibility.confirm ? "fa-eye-slash" : "fa-eye"}`} onClick={() => toggleVisibility('confirm')}></i>

                    <button type="submit">Submit</button>
                </form>

                <ul>
                    <li className={passwordCriterias.uppercase ? "check" : "cross"}>Password must contain uppercase letters</li>
                    <li className={passwordCriterias.lowercase ? "check" : "cross"}>Password must contain lowercase letters</li>
                    <li className={passwordCriterias.numbers ? "check" : "cross"}>Password must contain numbers</li>
                    <li className={passwordCriterias.special ? "check" : "cross"}>Password must contain special characters</li>
                    <li className={passwordCriterias.length ? "check" : "cross"}>Password must be at least 8 characters long</li>
                </ul>

                <p><strong>Note that if you reset your password, your email will be lost. You will need to input your email again when you log in.<br />As such, you are strongly recommended to update your email upon logging in.<br />If you do not do so, your account may be inaccessible should you lose your password again.</strong></p>
            </div>
        );
    }
}

export default ResetPasswordPage;