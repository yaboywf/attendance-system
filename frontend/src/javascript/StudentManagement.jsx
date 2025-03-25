import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";
import axios from "axios";

function StudentManagement() {
    const { user } = useOutletContext();
    const { addError } = useError();
    const [users, setUsers] = useState({ students: [], lecturers: [] });
    const [overlay, setOverlay] = useState(false);
    const [file, setFile] = useState(null);
    const [formType, setFormType] = useState("create");
    const [passwords, setPasswords] = useState({ new: false, confirm: false });

    if (user.account_type?.toLowerCase() !== "educator") {
        // window.location.href = "/dashboard";
    }

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_users", { withCredentials: true })
        .then(resp => {
            console.log(resp.response)
            if (resp.data.status === "success") {
                const usersWithImages = resp.data.data;

                ['students', 'lecturers'].forEach(accountType => {
                    usersWithImages[accountType].forEach(user => {
                        const imageBlob = new Blob([new Uint8Array(user.user_image.data)], { type: 'image/webp' });
                        const imageUrl = URL.createObjectURL(imageBlob);

                        user.user_image = imageUrl;
                    });
                });

                setUsers(usersWithImages);
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch users")
            console.error(err)
        })

        return () => {
            users.forEach(user => {
                if (user.user_image) {
                    URL.revokeObjectURL(user.user_image);
                }
            });
        };
    }, [])

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
        }
    };

    const setCreate = () => {
        setFormType("create");
        setOverlay(true)
    }

    const changeVisibility = (field) => {
        setPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        
        let formData = {}
        const form = new FormData(event.target);
        const reader = new FileReader();

        if (formType === "create") {
            if (form.get("username") === "") return addError("Please enter a username");
            if (form.get("new-password") === "") return addError("Please enter a password");
            if (form.get("confirm-password") === "") return addError("Please confirm your password");
            if (form.get("new-password") !== form.get("confirm-password")) return addError("Passwords do not match");
            if (!file) return addError("Please upload an image");
            if (file) {
                const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
                const mimeTypes = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf', '.webp': 'image/webp'};
                const fileExtension = file.name.split('.').pop().toLowerCase();
                const expectedMimeType = mimeTypes[`.${fileExtension}`];
                if (!allowedExtensions.includes(`.${fileExtension}`) || file.type !== expectedMimeType) return addError("File format not allowed")
            }
        }

        reader.onloadend = () => {
            const fileBlob = reader.result;

            if (formType === "create") {
                formData = {
                    username: form.get("username"),
                    password: form.get("new-password"),
                    account_type: form.get("account-type"),
                    user_image: fileBlob
                }
            }

            axios.post(`http://127.0.0.1:3000/api/${formType}_user`, formData, { headers: { 'Content-Type': 'application/json' }, withCredentials: true })
            .then(resp => {
                if (resp.data.status === "success") {
                    addError(resp.data.message, "success");
                    setOverlay(false);
                }
            })
            .catch(err => {
                addError("Something went wrong when trying to submit this form");
                console.error(err);
            })
        }

        reader.readAsDataURL(file);
    }

    return (
        <div className="student-management">
            <h1>Student Management</h1>

            <section>
                <label htmlFor="search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Search:
                </label>
                <input type="search" name="search" id="search" placeholder="Search for a student" autoComplete="off" />

                <button onClick={setCreate}>Create New Student</button>
            </section>

            <section>
                {users.lecturers.map(lecturer => {
                    return (
                        <div key={lecturer.id} className="user" data-id={lecturer.id}>
                            <img src={lecturer.user_image} alt={lecturer.username} />
                            <hr />
                            <div>
                                <p>{lecturer.username}</p>
                                <p>{lecturer.account_type}</p>
                            </div>
                        </div>
                    )
                })}

                {users.students.map(student => {
                    return (
                        <div key={student.id} className="user" data-id={student.id}>
                            <img src={student.user_image} alt={student.username} />
                            <hr />
                            <div>
                                <p>{student.username}</p>
                                <p>{student.account_type}</p>
                            </div>
                        </div>
                    )
                })}
            </section>

            {overlay && <div className="overlay">
                <form onSubmit={handleSubmit} noValidate>
                    <i className="fa-solid fa-xmark" onClick={() => setOverlay(false)}></i>
                    <h2>{formType === "create" ? "Create New User" : "User - "}</h2>

                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" id="username" placeholder="Enter Username" autoComplete="off" />

                    <label htmlFor="account-type">Account Type:</label>
                    <select name="account-type" id="account-type">
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                    </select>

                    <label htmlFor="password">Password:</label>
                    <div>
                        <input type={passwords.new ? "text" : "password"} name="new-password" id="password" placeholder="Enter Password" autoComplete="new-password" />
                        <i className={`fa-solid ${passwords.new ? "fa-eye-slash" : "fa-eye"}`} onClick={() => changeVisibility("new")}></i>
                    </div>

                    <label htmlFor="confirm-password">Confirm Password:</label>
                    <div>
                        <input type={passwords.confirm ? "text" : "password"} name="confirm-password" id="confirm-password" placeholder="Enter Password Again" autoComplete="off" />
                        <i className={`fa-solid ${passwords.confirm ? "fa-eye-slash" : "fa-eye"}`} onClick={() => changeVisibility("confirm")}></i>
                    </div>

                    <p>User Image:</p>
                    <label htmlFor="user-image" onDragOver={handleDragOver} onDrop={handleDrop} style={{ display: file ? "none" : "flex" }}>Drag and drop or click to upload</label>
                    <input type="file" name="user-image" id="user-image" accept=".jpg, .webp, .png, .jpeg" onChange={handleFileChange} />
                    <div style={{ display: file ? "flex" : "none" }}>
                        <p>{file ? file.name : "No file selected"}</p>
                        <i className="fa-solid fa-xmark" onClick={() => setFile(null)}></i>
                    </div>

                    <button type="submit">Submit</button>
                </form>
            </div>}
        </div>
    );
}

export default StudentManagement;