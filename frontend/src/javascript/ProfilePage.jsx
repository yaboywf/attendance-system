import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";
import axios from "axios";

function ProfilePage() {
    const { user } = useOutletContext();
    const { addError } = useError();
    const [passwordCriterias, setPasswordCriterias] = useState({ uppercase: false, lowercase: false, numbers: false, special: false, length: false })
    const [userImage, setUserImage] = useState(null)

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_user_image", { withCredentials: true, responseType: 'blob' })
        .then(resp => {
            const imageUrl = URL.createObjectURL(resp.data);
            setUserImage(imageUrl);
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch user's profile picture")
            console.error(err)
        })
    }, [])

    const handleSubmitPassword = async (e) => {
        e.preventDefault();

        if (e.target.new.value === "") return addError("Password cannot be empty");
        if (!passwordCriterias.uppercase || !passwordCriterias.lowercase || !passwordCriterias.numbers || !passwordCriterias.special || !passwordCriterias.length) return addError("Password does not meet requirements");
        if (e.target.new.value !== e.target.confirm.value) return addError("Passwords do not match");

        axios.put("http://127.0.0.1:3000/api/reset_password", { password: e.target.new.value, confirm: e.target.confirm.value }, { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                addError("Password Updated. You will be redirected shortly", "success")

                setTimeout(() => {
                    axios.put("http://127.0.0.1:3000/api/logout", {}, { withCredentials: true })
                    .then(resp => {
                        if (resp.data.status === "success") {
                            window.location.href = "/"
                        }
                    })
                    .catch(err => {
                        addError("Something went wrong when trying to logout")
                        console.error(err)
                    })
                }, 3000)
            }
        })
        .catch((err) => {
            addError("Something went wrong when reseting password")
            console.error(err)
        });
    }

    const handleSubmitEmail = (e) => {
        e.preventDefault();
        let submit = true;
        
        const email = e.target.form.email;
        if (email.value === "") {
            addError("Email cannot be empty")
            submit = false
            return;
        }

        if (!email.checkValidity()) {
            addError("Email is invalid")
            submit = false
            return;
        }

        if (submit) {
            axios.put("http://127.0.0.1:3000/api/update_email", { email: email.value }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
            .then(resp => {
                if (resp.data.status === "success") {
                    addError("Email Updated", "success")
                }
            })
            .catch(err => {
                addError(err.response.data.message)
                console.error(err)
            })
        }
    }

    const capitalize = (string) => {
        if (string === "") return;
        return string.charAt(0).toUpperCase() + string.slice(1);
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

    return (
        <div className="profile">
            <h1>My Profile</h1>

            <section>
                <div className="profile-picture" style={{ backgroundImage: `url(${userImage})`}}></div>

                <div>
                    <p>Name:</p>
                    <p>{user?.username || "User"}</p>

                    <p>Email:</p>
                    <p>{user?.email || "Email"}</p>
                    
                    <p>Account Type:</p>
                    <p>{capitalize(user?.account_type || "") || "Account Type"}</p>
                </div>
            </section>

            <form>
                <h2>Edit Profile</h2>

                <h3>Email</h3>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter Email" autoComplete="email" defaultValue={user?.email || ""} required />

                <button type="submit" onClick={handleSubmitEmail}>Update Email</button>
            </form>

            <form onSubmit={handleSubmitPassword}>
                <h3>Password</h3>
                <input type="text" name="username" autoComplete="username" id="username" hidden />

                <label htmlFor="current-password">Current Password:</label>
                <input type="password" id="current-password" name="current-password" placeholder="Enter Current Password" autoComplete="current-password" required />

                <label htmlFor="new-password">New Password:</label>
                <input type="password" id="new-password" name="new" placeholder="Enter New Password" autoComplete="new-password" required onChange={(e) => check(e.target.value)} />

                <label htmlFor="confirm-password">Confirm Password:</label>
                <input type="password" id="confirm-password" name="confirm" placeholder="Enter New Password Again" autoComplete="off" required />

                <ul>
                    <li className={passwordCriterias.uppercase ? "check" : "cross"}>Password must contain uppercase letters</li>
                    <li className={passwordCriterias.lowercase ? "check" : "cross"}>Password must contain lowercase letters</li>
                    <li className={passwordCriterias.numbers ? "check" : "cross"}>Password must contain numbers</li>
                    <li className={passwordCriterias.special ? "check" : "cross"}>Password must contain special characters</li>
                    <li className={passwordCriterias.length ? "check" : "cross"}>Password must be at least 8 characters long</li>
                </ul>

                <button type="submit">Update Password</button>
            </form>
        </div>
    );
}

export default ProfilePage;