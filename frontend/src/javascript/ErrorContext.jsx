import React, { createContext, useState, useContext } from "react";

// Create a Context for the error
const ErrorContext = createContext();

export const useError = () => {
    return useContext(ErrorContext);
};

export const ErrorProvider = ({ children }) => {
    const [errors, setErrors] = useState([]);

    const addError = (message) => {
        const id = Date.now();
        setErrors((prev) => {
            if (!Array.isArray(prev)) return [];
            return [...prev, { id, message }];
        });

        if (process.env.NODE_ENV !== "test") {
            setTimeout(() => {
                setErrors((prev) => {
                    if (!Array.isArray(prev)) return [];
                    return prev.filter((error) => error.id !== id);
                });
            }, 3000);
        }
    };

    return (
        <ErrorContext.Provider value={{ errors, addError }}>
            {children}
        </ErrorContext.Provider>
    );
};
