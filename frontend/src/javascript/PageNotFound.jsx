import React, { useState, useEffect } from "react";
import { useError } from "./ErrorContext"

function PageNotFound() {
    const { addError } = useError()
    const [page, setPage] = useState(null)

    useEffect(() => {
        const pathname = window.location.pathname
        setPage(pathname)
        addError("Page not found")
    }, [])

    return (
        <div className="not-found">
            <h1>We are unable to find the page that you are looking for</h1>
            <h2>Perhaps a typo?</h2>
            
            <p>Path: {page}</p>
        </div>
    )
}

export default PageNotFound