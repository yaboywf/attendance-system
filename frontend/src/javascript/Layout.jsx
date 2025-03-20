import React, { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Aside } from "./Aside";
import { Footer } from "./Footer";
import axios from "axios";

function Layout() {
    const [headerType, setheaderType] = useState("public");
    const [user, setUser] = useState(null);

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_credentials", { withCredentials: true })
        .then((res) => {
            if (res.data.status === "success") {
                setheaderType("member");
                setUser(res.data.user)
                if (window.location.pathname == "/") window.location.href = "/dashboard";
            }
        })
        .catch((err) => {
            if ((err.response?.data?.status == "fail" || err.response?.status == 401) && window.location.pathname !== "/") {
                window.location.href = "/";
            }
        });

        // setheaderType("member");
    }, [])
    
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