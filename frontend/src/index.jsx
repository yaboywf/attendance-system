import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Layout from './javascript/Layout'
import LoginPage from './javascript/LoginPage';
import DashboardPage from './javascript/Dashboard';
import FormsPage from './javascript/Forms';
import AttendanceMarking from './javascript/AttendanceMarking';
import ProfilePage from './javascript/ProfilePage';
import HelpPage from './javascript/HelpPage';
import ErrorStack from "./javascript/Errors";
import { ErrorProvider } from "./javascript/ErrorContext";

import './styles/general.scss'
import './styles/Aside.scss'
import './styles/LoginPage.scss'
import './styles/DashboardPage.scss'
import './styles/Forms.scss'
import './styles/Attendance.scss'
import './styles/ProfilePage.scss'
import './styles/HelpPage.scss'

const container = document.body;
const root = createRoot(container);

root.render(
    <ErrorProvider>
        <Router>
            <ErrorStack />
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/forms" element={<FormsPage />} />
                    <Route path="/attendance" element={<AttendanceMarking />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/help" element={<HelpPage />} />
                    <Route path="/terms" element={<HelpPage />} />
                </Route>
            </Routes>
        </Router>
    </ErrorProvider>
);