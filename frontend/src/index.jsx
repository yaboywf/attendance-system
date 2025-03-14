import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Layout from './javascript/Layout'
import LoginPage from './javascript/LoginPage';
import DashboardPage from './javascript/Dashboard';
import FormsPage from './javascript/Forms';

import './styles/general.scss'
import './styles/Aside.scss'
import './styles/LoginPage.scss'
import './styles/DashboardPage.scss'
import './styles/Forms.scss'

const container = document.body;
const root = createRoot(container);

root.render(
    <Router>
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/forms" element={<FormsPage />} />
            </Route>
        </Routes>
    </Router>
);