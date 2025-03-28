import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";
import { useOutletContext } from 'react-router-dom';

function Approval() {
    const { addError } = useError();
    const { user } = useOutletContext();
    const [forms, setForms] = useState([]);
    const [overlay, setOverlay] = useState(false);
    const [selectedForm, setSelectedForm] = useState(null);
    const [overallAttendance, setOverallAttendance] = useState({ "pending": 0, "approved": 0, "rejected": 0 });

    if (user?.account_type?.toLowerCase() !== "lecturer") {
        window.location.href = "/dashboard";
    }

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_all_forms", { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                setForms(resp.data.data)
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch forms")
            console.error(err)
        })
    }, [])

    const filter = () => {
        const search = document.getElementById("search").value.toLowerCase();
        const selectedRadio = document.querySelector('input[name="approval_toggle"]:checked');
        const pending = document.getElementById("pending").checked;

        document.querySelectorAll(".row").forEach(form => {
            const username = form.querySelector("p:nth-child(2)").textContent.toLowerCase();
            const type = form.querySelector("p:nth-child(3)").textContent.toLowerCase();
            const status = form.querySelector("p:nth-child(4)").textContent.toLowerCase();

            if (username.includes(search) && (selectedRadio.value === "all" || type === selectedRadio.value) && (pending ? status === "pending" : true)) {
                form.style.display = "contents";
            } else {
                form.style.display = "none";
            }
        });
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.put(`http://127.0.0.1:3000/api/update_form/${selectedForm.id}`, { status: e.target.status.value, iv: selectedForm.iv }, { headers: { "Content-Type": "application/json" }, withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                addError("Form Updated Successfully. Reload to see changes.", "success");
                setOverlay(false);
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to update form");
            console.error(err);
        })
    }

    const openOverlay = (form) => {
        setSelectedForm(form);
        setOverlay(true);
        setOverallAttendance({ "pending": 0, "approved": 0, "rejected": 0 });

        axios.get(`http://127.0.0.1:3000/api/get_forms/${form.user_id}`, { withCredentials: true })
        .then(resp => {
            if (resp.data.status === "success") {
                let overall = { "pending": 0, "approved": 0, "rejected": 0 };
                resp.data.data.forEach(form => {
                    overall[form.status.toLowerCase()] += 1;
                })

                setOverallAttendance(overall);
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch overall attendance");
            console.error(err);
        })
    }

    return (
        <div className="approval">
            <h1>Approve MC / LOA</h1>

            <section>
                <label htmlFor="search">Search:</label>
                <input type="text" placeholder="Search by username" id="search" autoComplete="off" onChange={filter} />

                <input type="radio" name="approval_toggle" id="all" value={"all"} defaultChecked onChange={filter} />
                <label htmlFor="all">All</label>

                <input type="radio" name="approval_toggle" id="mc" value={"mc"} onChange={filter} />
                <label htmlFor="mc">MC</label>

                <input type="radio" name="approval_toggle" id="loa" value={"loa"} onChange={filter}  />
                <label htmlFor="loa">LOA</label>

                <input type="checkbox" id="pending" onChange={filter} />
                <label htmlFor="pending">Pending</label>
            </section>

            <section>
                <p>No.</p>
                <p>Username</p>
                <p>Type</p>
                <p>Status</p>
                <p>From</p>
                <p>To</p>
                <p>Reason</p>
                <p>Edit</p>

                {forms.map((form, index) => (
                    <div className="row" key={form.id}>
                        <p>{index + 1}</p>
                        <p>{form.username}</p>
                        <p>{form.form_type}</p>
                        <p className={form.status}>{form.status}</p>
                        <p>{form.start_date.replace("T", " ")}</p>
                        <p>{form.end_date.replace("T", " ")}</p>
                        <p>{form.reason || "-"}</p>
                        <p>
                            <i className="fa-solid fa-edit" onClick={() => openOverlay(form)}></i>
                        </p>
                    </div>
                ))}
            </section>

            {overlay && <div className="overlay">
                <form onSubmit={handleSubmit} noValidate>
                    <i className="fa-solid fa-xmark" onClick={() => { setOverlay(false); setSelectedForm(null); }}></i>
                    <h2>Update Form</h2>

                    <p>Username:</p>
                    <span>{selectedForm?.username}</span>

                    <p>Type:</p>
                    <span>{selectedForm?.form_type}</span>

                    <p>From:</p>
                    <span>{selectedForm?.start_date.replace("T", " ")}</span>

                    <p>To:</p>
                    <span>{selectedForm?.end_date.replace("T", " ")}</span>

                    <p>Reason:</p>
                    <span>{selectedForm?.reason || "-"}</span>

                    <p>Applied {selectedForm.form_type.toUpperCase()}:</p>
                    <span>{overallAttendance.pending} Pending; {overallAttendance.approved} Approved; {overallAttendance.rejected} Rejected</span>

                    <p>Status:</p>
                    <select name="status" id="status" defaultValue={selectedForm?.status}>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <button type="submit">Update</button>
                </form>
            </div>}
        </div>
    )
}

export default Approval;