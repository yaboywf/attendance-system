import React from "react";
import "../styles/general.scss";

function ErrorStack({ errors }) {
    return (
        <div className="error-stack">
            {errors.map((error) => (
                <div key={error.id} className="message">
                    {error.message}
                </div>
            ))}
        </div>
    );
}

export { ErrorStack };