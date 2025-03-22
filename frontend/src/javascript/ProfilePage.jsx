import React from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";
import axios from "axios";

function ProfilePage() {
    const { user } = useOutletContext();
    const { addError } = useError();

    const handleSubmit = async (e) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:3000/api/update_profile", e.target, { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") window.location.reload()
        })
        .catch(() => addError("Something went wrong when updating profile"));
    }

    const handleSubmitEmail = (e) => {
        e.preventDefault();
        let submit = true;
        console.log("email processing")

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

        console.log("passed")

        if (submit) {
            axios.put("http://127.0.0.1:3000/api/update_email", { email: email.value }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
            .then(resp => {
                if (resp.data.status === "success") {
                    addError("Email Updated", "success")
                }
            })
            .catch(err => {
                addError("Something went wrong when trying to update your email")
                console.error(err)
            })
        }
    }

    const capitalize = (string) => {
        if (string === "") return;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    return (
        <div className="profile">
            <h1>My Profile</h1>

            <section>
                <div className="profile-picture"></div>

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

            <form>
                <h3>Password</h3>
                <label htmlFor="current-password">Current Password:</label>
                <input type="password" id="current-password" name="current-password" placeholder="Enter Current Password" autoComplete="current-password" />

                <label htmlFor="new-password">New Password:</label>
                <input type="password" id="new-password" name="new-password" placeholder="Enter New Password" autoComplete="new-password" />
            
                <ul>
                    <li className="check">Password must contain uppercase letters</li>
                    <li className="cross">Password must contain lowercase letters</li>
                    <li className="cross">Password must contain numbers</li>
                    <li className="cross">Password must contain special characters</li>
                    <li className="check">Password must be at least 8 characters long</li>
                </ul>

                <button type="submit" onClick={handleSubmit}>Update Password</button>
            </form>
        </div>
    );
}

export default ProfilePage;