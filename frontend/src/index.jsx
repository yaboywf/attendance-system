import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage';

const container = document.body;
const root = createRoot(container);

root.render(
    <Router>
        <Routes>
            <Route path="/" element={<LoginPage />}></Route>
        </Routes>
    </Router>
);