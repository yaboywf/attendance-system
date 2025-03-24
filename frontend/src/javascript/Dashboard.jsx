import React from "react";
import { useOutletContext } from 'react-router-dom';

function DashboardPage() {
    const { user } = useOutletContext();

    return (
        <div className="dashboard-page">
            <h1>Hello, {user?.username || "User"}</h1>

            <section>
                graphs
            </section>

            <section>
                <h2>Pending Tasks</h2>

                <div>
                    list of pending tasks
                </div>
            </section>
        </div>
    );
}

export default DashboardPage;
