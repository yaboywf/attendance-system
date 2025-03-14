import React, { useState } from "react";
import FormContent from "./FormContent";
import { useOutletContext } from 'react-router-dom';

function FormsPage() {
    const { user } = useOutletContext();
    const [formType, setFormType] = useState("MC");

    const handleFormTypeChange = (e) => {
        setFormType(e.target.value);
    }

    return (
        <div className="forms">
            <h1>Submit MC / LOA</h1>

            <div className="toggle-buttons">
                <input type="radio" name="forms_toggle" id="MC-toggle" defaultChecked={true} onChange={handleFormTypeChange} value="MC" />
                <label htmlFor="MC-toggle">MC</label>
                
                <input type="radio" name="forms_toggle" id="LOA-toggle" onChange={handleFormTypeChange} value="LOA" />
                <label htmlFor="LOA-toggle">LOA</label>
            </div>

            <div className="forms-container">
                <FormContent username={user?.username} formType={formType} />
            </div>
        </div>
    )
}

export default FormsPage