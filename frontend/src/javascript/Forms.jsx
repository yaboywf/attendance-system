import React, { useState } from "react";
import LOA from "./LOA";
import { ErrorStack } from "./Errors";

function FormsPage() {
    const [errors, setErrors] = useState([]);
    const [formType, setFormType] = useState("MC");

    const handleFormTypeChange = (e) => {
        setFormType(e.target.value);
    }

    const addError = (message) => {
        const id = Date.now();
        setErrors((prev) => [...prev, { id, message }]); 

        if (process.env.NODE_ENV !== "test") {
            setTimeout(() => {
                setErrors((prev) => prev.filter((error) => error.id !== id));
            }, 3000);   
        }
    };

    return (
        <div className="forms">
            <ErrorStack errors={errors} />

            <h1>Submit MC / LOA</h1>

            <div className="toggle-buttons">
                <input type="radio" name="forms_toggle" id="MC-toggle" defaultChecked={true} onChange={handleFormTypeChange} value="MC" />
                <label htmlFor="MC-toggle">MC</label>
                
                <input type="radio" name="forms_toggle" id="LOA-toggle" onChange={handleFormTypeChange} value="LOA" />
                <label htmlFor="LOA-toggle">LOA</label>
            </div>

            <div className="forms-container">
                {formType === "LOA" && <LOA addError={addError} />}
                {/* {formType === "LOA" && } */}
            </div>
        </div>
    )
}

export default FormsPage