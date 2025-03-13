import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './javascript/Layout'
import LoginPage from './javascript/LoginPage';

import './styles/general.scss'
import './styles/LoginPage.scss'

const container = document.body;
const root = createRoot(container);

root.render(
    <Router>
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<LoginPage />}></Route>
            </Route>
        </Routes>
    </Router>
);