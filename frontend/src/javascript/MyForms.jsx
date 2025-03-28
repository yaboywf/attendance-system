import React, { useState, useEffect } from "react";
import axios from "axios";
import { useError } from "./ErrorContext";

function MyForms() {
    const { addError } = useError()
    const [forms, setForms] = useState([]);

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_user_attendance", { withCredentials: true })
        .then(resp => {
            console.log(resp.data)
            if (resp.data.status === "success") {
                setForms(resp.data.data)
            }
        })
        .catch(err => {
            addError("Something went wrong when trying to fetch user's attendance")
            console.error(err)
        })
    }, [])

    return (
        <div className="myforms">
            <h1>My Forms</h1>

            <section>
                <p>No.</p>
                <p>Type</p>
                <p>Status</p>
                <p>From</p>
                <p>To</p>
                <p>Reason</p>

                {forms.map((form, index) => (
                    <div className="row" key={form.id}>
                        <p>{index + 1}</p>
                        <p>{form.form_type}</p>
                        <p className={form.status}>{form.status}</p>
                        <p>{form.start_date?.replace("T", " ")}</p>
                        <p>{form.end_date?.replace("T", " ")}</p>
                        <p>{form.reason || "-"}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}

export default MyForms;