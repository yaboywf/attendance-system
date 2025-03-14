import React, { useState, useEffect } from 'react'
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Aside } from "./Aside";
import { Footer } from "./Footer";
import axios from "axios";

function Layout() {
    const [headerType, setheaderType] = useState("public");

    useEffect(() => {
        axios.get("http://127.0.0.1:3000/api/get_credentials")
        .then((res) => {
            if (res.data.status === "success") {
                setheaderType("member");
            }
        })
        .catch((err) => {
            if (err.response?.data?.status !== "fail") {
                console.error(err.response);
            }
        });

        setheaderType("member");
    }, [])

    return (
        <>
            {headerType === "public" && <Header />}
            <main>
                {headerType === "member" && <Aside />}
                <Outlet />
            </main>
            {headerType === "public" && <Footer />}
        </>
    );
}

export default Layout;