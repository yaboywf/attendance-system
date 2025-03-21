import React from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";
import axios from "axios";

function ProfilePage() {
    const { user } = useOutletContext();
    const { setError } = useError();

    const handleSubmit = async (e) => {
        e.preventDefault();
        axios.post("http://127.0.0.1:3000/api/update_profile", e.target, { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") window.location.reload()
        })
        .catch(() => setError("Something went wrong when updating profile"));
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
                    <p>{capitalize(user?.account_type) || "Account Type"}</p>
                </div>
            </section>

            <form>
                <h2>Edit Profile</h2>

                <h3>Email</h3>
                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" placeholder="Enter Email" autoComplete="email" defaultValue={user?.email || ""} />

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
            </form>

            <button type="submit" onClick={handleSubmit}>Update Profile</button>
        </div>
    );
}

export default ProfilePage;