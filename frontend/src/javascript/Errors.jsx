import React from "react";
import "../styles/general.scss";
import { useError } from "./ErrorContext";

function ErrorStack() {
    const { errors } = useError();

    return (
        <div className="error-stack">
            {errors && errors.map((error) => (
                <div key={error.id} className="message">
                    {error.message}
                </div>
            ))}
        </div>
    );
}

export { ErrorStack };