import React, { useState, useEffect } from "react";
import { useOutletContext } from 'react-router-dom';
import { useError } from "./ErrorContext";
import axios from "axios";

function StudentManagement() {
    const { user } = useOutletContext();
    const { addError } = useError();
    const [users, setUsers] = useState({ students: [], lecturers: [] });

    if (user.account_type.toLowerCase() !== "educator") {
        // window.location.href = "/dashboard";
    }

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_users", { withCredentials: true })
            .then(resp => {
                if (resp.data.status === "success") {
                    const usersWithImages = resp.data.data;

                    ['students', 'lecturers'].forEach(accountType => {
                        usersWithImages[accountType].forEach(user => {
                            const imageBlob = new Blob([new Uint8Array(user.user_image.data)], { type: 'image/webp' });
                            console.log(user.user_image)
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

    return (
        <div className="student-management">
            <h1>Student Management</h1>

            <section>
                <label htmlFor="search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    Search:
                </label>
                <input type="search" name="search" id="search" placeholder="Search for a student" autoComplete="off" />

                <button>Create New Student</button>
            </section>

            <section>
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
        </div>
    );
}

export default StudentManagement;