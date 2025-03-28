import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";

function Approval() {
    const { addError } = useError();
    const [forms, setForms] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_all_forms", { withCredentials: true })
        .then(resp => {
            console.log(resp.data)
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

            if (username.includes(search) && (selectedRadio.value === "all" || type === selectedRadio.value) && (pending ? status === "pending" : false)) {
                form.style.display = "contents";
            } else {
                form.style.display = "none";
            }
        });
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

                <input type="checkbox" id="pending" onChange={filter} defaultChecked />
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
                            <i className="fa-solid fa-edit"></i>
                        </p>
                    </div>
                ))}
            </section>
        </div>
    )
}

export default Approval;