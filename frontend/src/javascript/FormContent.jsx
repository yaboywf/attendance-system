import axios from "axios";
import React, { useState, useRef } from "react";
import { useError } from "./ErrorContext";

function FormContent({ username, formType }) {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);
    const { addError } = useError();

    const getLocalDatetime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
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

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        if (new Date(formData.get("end_date")) < new Date(formData.get("start_date"))) return addError("End date cannot be earlier than start date")
        if (formData.get("reason") !== null && formData.get("reason") === "") return addError("Please enter a reason");
        if (formData.get("reason") && formData.get("reason").length > 350) return addError("Input too long. Maximum of 350 characters")
        if (!file) return addError("Please upload a file");
        if (file) {
            const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf', '.webp'];
            const mimeTypes = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.pdf': 'application/pdf', '.webp': 'image/webp'};
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const expectedMimeType = mimeTypes[`.${fileExtension}`];
            if (!allowedExtensions.includes(`.${fileExtension}`) || file.type !== expectedMimeType) return addError("File format not allowed")
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const fileBlob = reader.result;

            axios.post("http://127.0.0.1:3000/api/forms", {
                name: formData.get("name"),
                form_type: formType,
                start_date: formData.get("start_date"),
                end_date: formData.get("end_date"),
                reason: formData.get("reason"),
                file: fileBlob,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true
            })
            .then(res => {
                if (res.data.status === "success") {
                    addError("Form have been submitted. Pending review.", "success")
                    e.target.reset()
                }
            })
            .catch(err => {
                addError(`Something went wrong when submitting your ${formType}`);
                console.error(err);
            });
        };

        reader.readAsDataURL(file);
    };

    return (
        <form method="post" encType="multipart/form-data" onSubmit={(e) => submit(e)} noValidate>
            <label htmlFor="name">Name:</label>
            <input type="text" name="name" id="name" disabled required defaultValue={username} placeholder="Enter name" autoComplete="off" />

            <label htmlFor="start_date">Start Date:</label>
            <input type="datetime-local" name="start_date" id="start_date" required min={getLocalDatetime()} defaultValue={getLocalDatetime()}/>

            <label htmlFor="end_date">End Date:</label>
            <input type="datetime-local" name="end_date" id="end_date" required min={getLocalDatetime()} defaultValue={getLocalDatetime()}/>

            {formType === "LOA" && <>
                <label htmlFor="reason">Reason:</label>
                <input type="text" name="reason" id="reason" required placeholder="Enter reason" />
            </>}

            <p>Upload Document:</p>
            <label htmlFor="upload" onDragOver={handleDragOver} onDrop={handleDrop} style={{ display: file ? "none" : "flex" }}>Drag and drop or click to upload</label>
            <input type="file" name="upload" id="upload" required accept=".pdf, .jpg, .webp, .png, .jpeg" ref={fileInputRef} onChange={handleFileChange} />
            <div style={{ display: file ? "flex" : "none" }}>
                <p>{file ? file.name : null}</p>
                <button aria-label="Delete file" onClick={() => setFile(null)}>
                    <i className="fa fa-trash"></i>
                </button>
            </div>

            <button type="submit">Submit</button>
        </form>
    )
}

export default FormContent