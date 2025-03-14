import axios from "axios";
import React, { useState, useRef } from "react";
import PropTypes from "prop-types";

function MC({ addError }) {
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

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

        if (!file) return addError("Please upload a file");

        axios.post("http://127.0.0.1:3000/api/mc", formData, {
            headers: {
                "Content-Type": "multipart/form-data", // Ensure proper file handling
            },
        })
        .then(res => {
            if (res.data.status === "success") {
                window.location.href = "/dashboard";
            }
        })
        .catch(err => {
            addError("Something went wrong");
            console.error(err.response);
        });
    };

    return (
        <form method="post" encType="multipart/form-data" onSubmit={(e) => submit(e)} noValidate>
            <label htmlFor="name">Name:</label>
            <input type="text" name="name" id="name" disabled required defaultValue="John Doe" placeholder="Enter name" autoComplete="off" />

            <label htmlFor="start_date">Start Date:</label>
            <input type="datetime-local" name="start_date" id="start_date" required min={getLocalDatetime()} defaultValue={getLocalDatetime()} placeholder="Enter start date" />

            <label htmlFor="end_date">End Date:</label>
            <input type="datetime-local" name="end_date" id="end_date" required min={getLocalDatetime()} defaultValue={getLocalDatetime()} placeholder="Enter end date" />

            <p>Upload Document:</p>
            <label htmlFor="upload" onDragOver={handleDragOver} onDrop={handleDrop} style={{ display: file ? "none" : "flex" }}>Drag and drop or click to upload</label>
            <input type="file" name="upload" id="upload" required accept=".pdf, .jpg, .webp, .png, .jpeg, .doc, .docx" ref={fileInputRef} onChange={handleFileChange} />
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

MC.propTypes = {
    addError: PropTypes.func.isRequired,
};

export default MC