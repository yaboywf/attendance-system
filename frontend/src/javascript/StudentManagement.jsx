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
    const [selectedUser, setSelectedUser] = useState(null);
    const [newImage, setNewImage] = useState(null);

    if (user?.account_type?.toLowerCase() !== "lecturer") {
        window.location.href = "/dashboard";
    }

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_users", { withCredentials: true })
        .then(resp => {
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
    }, [])

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setNewImage(previewUrl);
        }
    };

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

    const handleCreate = (event) => {
        event.preventDefault();
        
        let formData = {}
        const form = new FormData(event.target);
        const reader = new FileReader();

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

        reader.onloadend = () => {
            const fileBlob = reader.result;

            formData = {
                username: form.get("username"),
                password: form.get("new-password"),
                account_type: form.get("account-type"),
                user_image: fileBlob
            }

            axios.post('http://127.0.0.1:3000/api/create_user', formData, { headers: { 'Content-Type': 'application/json' }, withCredentials: true })
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

    const handleUpdate = async (event) => {
        event.preventDefault();

        let formData = {}
        const form = new FormData(event.target);
        const file = form.get("new-user-image");

        if (form.get("username") === "") return addError("Please enter a username");

        const readFile = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        };

        if (file && file.size > 0) {
            try {
                const fileBlob = await readFile(file);
    
                formData = {
                    user_id: selectedUser.id,
                    username: form.get("username"),
                    account_type: form.get("account-type"),
                    user_image: fileBlob
                };
            } catch (error) {
                console.error("Error reading file:", error);
                return addError("Error reading the image file.");
            }
        } else {
            formData = {
                user_id: selectedUser.id,
                username: form.get("username"),
                account_type: form.get("account-type"),
                user_image: null
            };
        }
    
        try {
            const resp = await axios.put(`http://127.0.0.1:3000/api/update_user`, formData, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
    
            if (resp.data.status === "success") {
                addError(resp.data.message, "success");
                setOverlay(false);
            }
        } catch (err) {
            addError("Something went wrong when trying to submit this form");
            console.error(err);
        }
    }

    const handleDelete = () => {
        const isConfirmed = window.confirm("Are you sure you want to delete this user?");

        if (isConfirmed) {
            const user = selectedUser.id

            axios.delete('http://127.0.0.1:3000/api/delete_user', {
                params: { user: user },
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })
            .then(resp => {
                if (resp.data.status === "success") {
                    addError(resp.data.message, "success")
                }
            })
            .catch(err => {
                addError("Something went wrong when trying to submit this form");
                console.error(err);
            })
        } else {
            return
        }
    }

    const filter = (e) => {
        const search = e.target.value.toLowerCase()
        Array.from(document.getElementsByClassName("user")).map(user => {
            const username = user.querySelector("p").textContent.toLowerCase()
            user.style.display = username.includes(search) ? "flex" : "none";
        })
    }

    const selectUser = (event) => {
        const userId = event.currentTarget.getAttribute("data-id");
        const user = users.students.find(user => user.id === parseInt(userId)) || users.lecturers.find(user => user.id === parseInt(userId));
        
        if (user) {
            setFormType("update");
            setSelectedUser(user);
            setOverlay(true);
        }
    }

    return (
        <div className="student-management">
            <h1>User Management</h1>

            <section>
                <label htmlFor="search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Search:
                </label>
                <input type="search" name="search" id="search" placeholder="Search for a student" autoComplete="off" onInput={(e) => filter(e)} />

                <button onClick={setCreate}>Create New Account</button>
            </section>

            <section>
                {users.lecturers.map(lecturer => {
                    return (
                        <div key={lecturer.id} className="user" data-id={lecturer.id} onClick={(e) => selectUser(e)}>
                            <img src={lecturer.user_image} alt={lecturer.username} />
                            <hr />
                            <div>
                                <p>{lecturer?.username}</p>
                                <p>{lecturer?.account_type}</p>
                            </div>
                        </div>
                    )
                })}

                {users.students.map(student => {
                    return (
                        <div key={student.id} className="user" data-id={student.id} onClick={(e) => selectUser(e)}>
                            <img src={student.user_image} alt={student.username} />
                            <hr />
                            <div>
                                <p>{student?.username}</p>
                                <p>{student?.account_type}</p>
                            </div>
                        </div>
                    )
                })}
            </section>

            {overlay && <div className="overlay">
                <form onSubmit={formType === "create" ? handleCreate : handleUpdate} noValidate data-type={formType}>
                    <i className="fa-solid fa-xmark" onClick={() => { setOverlay(false); setSelectedUser(null); }}></i>
                    <h2>{formType === "create" ? "Create New User" : `User - ${selectedUser.username}`}</h2>

                    {formType === "update" && <label htmlFor="new-user-image" style={{ background: `url(${ newImage || selectedUser.user_image}) center/cover no-repeat` }}></label>}

                    <label htmlFor="username">Username:</label>
                    <input type="text" name="username" id="username" placeholder="Enter Username" autoComplete="off" defaultValue={selectedUser?.username} />

                    <label htmlFor="account-type">Account Type:</label>
                    <select name="account-type" id="account-type" defaultValue={selectedUser?.account_type}>
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                    </select>

                    {formType === "create" && <>
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
                    </>}

                    {formType === "update" && <input type="file" name="new-user-image" id="new-user-image" accept=".jpg, .webp, .png, .jpeg" onChange={handleImageChange} />}

                    <div>
                        <button type="submit">{formType === "create" ? "Create" : "Update"}</button>
                        {formType === "update" && <button type="button" onClick={handleDelete}>Delete</button>}
                    </div>
                </form>
            </div>}
        </div>
    );
}

export default StudentManagement;