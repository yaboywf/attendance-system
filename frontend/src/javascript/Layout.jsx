import React, { useState, useEffect } from 'react'
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Aside } from "./Aside";
import { Footer } from "./Footer";
import axios from "axios";

function Layout() {
    const navigate = useNavigate()
    const [headerType, setheaderType] = useState("public")
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_credentials", { withCredentials: true })
        .then(res => {
            if (res.data.status === "success") {
                setheaderType("member");
                setUser(res.data.user)
                setLoading(false)
                if (window.location.pathname == "/") navigate("/dashboard");
            }
        })
        .catch(err => {
            if (err.response?.status == 401) {
                if (window.location.pathname !== "/") {
                    navigate("/");
                }
            }

            setLoading(false)
        });

        // setheaderType("member");
    }, [navigate])

    if (loading) {
        return (
            <main className='loading'>
                <i className='fa-solid fa-spinner-third'></i>
                <p>Please wait a moment</p>
            </main>
        )
    }
    
    return (
        <>
            {headerType === "public" && <Header />}
            <main>
                {headerType === "member" && <Aside user={{ user }} />}
                <Outlet context={{ user }} />
            </main>
            {headerType === "public" && <Footer />}
        </>
    );
}

export default Layout;