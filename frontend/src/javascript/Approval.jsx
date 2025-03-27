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

    return (
        <div>
            <h1>Approve MC / LOA</h1>

            <section>
                {forms.map((form, index) => (
                    <div key={form.id}>
                        <p>{index + 1}</p>
                        <p>{form.form_type}</p>
                        <p>{form.status}</p>
                        <p>{form.start_date}</p>
                        <p>{form.reason}</p>
                        <p>{form.end_date}</p>
                    </div>
                ))}
            </section>
        </div>
    )
}

export default Approval;