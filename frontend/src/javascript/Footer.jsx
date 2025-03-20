import React from 'react'

const Footer = () => {
    return (
        <footer>
            <p>Made by Dylan Yeo</p>
            <button onClick={() => window.location.href = "/terms"}>Terms of Use</button>
        </footer>
    )
}

export { Footer }