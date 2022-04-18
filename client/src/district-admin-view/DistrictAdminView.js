import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faIdBadge, faDoorClosed, faCog, faUser } from '@fortawesome/free-solid-svg-icons';

import { Routes, Route, Navigate, Link } from "react-router-dom"

import { Theme } from '../Theme';

import './DistrictAdminView.css'

import ManageRoomsView from './views/ManageRoomsView'
import ManageUsersView from './views/ManageUsersView';
import HallMonitorView from './hall-monitor-view/HallMonitorView';

const View = {
    Dashboard: "Dashboard",
    HallMonitor: "Hall Monitor",
    Rooms: "Rooms",
    Users: "Users"
}

export default function DistrictAdminView({ currentUser, currentTheme, setCurrentTheme }) {

    const [currentView, setCurrentView] = useState(View.HallMonitor);

    const hallMonitorView = <HallMonitorView currentUser={currentUser} currentTheme={currentTheme} />
    const manageRoomsView = <ManageRoomsView currentUser={currentUser} currentTheme={currentTheme} />
    const manageUsersView = <ManageUsersView currentUser={currentUser} currentTheme={currentTheme} />

    return (
        <section id="district-admin-view">
            <div id="sidebar" style={{backgroundColor: currentTheme.offset}}>
                <ul style={{color: currentTheme.text}}>
                    <div className="controls">
                        <h1>{currentUser.name}</h1>
                        <FontAwesomeIcon id="settings-button" icon={faCog} style={{color: currentTheme.text}} 
                        onClick={() => setCurrentTheme(currentTheme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)}/>
                    </div>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <Link to="/dashboard" style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.Dashboard ? "active" : null} onClick={() => setCurrentView(View.Dashboard)}>
                            <p>Dashboard<FontAwesomeIcon className="icon" icon={faChartLine} /></p>
                        </li>
                    </Link>
                    <Link to="/hall-monitor" style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.HallMonitor ? "active" : null} onClick={() => setCurrentView(View.HallMonitor)}>
                            <p>Hall Monitor<FontAwesomeIcon className="icon" icon={faIdBadge} /></p>
                        </li>
                    </Link>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <Link to="/rooms" style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.Rooms ? "active" : null} onClick={() => setCurrentView(View.Rooms)}>
                            <p>Rooms<FontAwesomeIcon className="icon" icon={faDoorClosed} /></p>
                        </li>
                    </Link>
                    <Link to="/users" style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset, color: currentTheme.text}} className={currentView === View.Users ? "active" : null} onClick={() => setCurrentView(View.Users)}>
                            <p>Users<FontAwesomeIcon className="icon" icon={faUser} /></p>
                        </li>
                    </Link>
                </ul>
            </div>
            <div id="sidebar-offset"></div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />}></Route>
                    <Route path="/dashboard" element={null} />
                    <Route path="/hall-monitor" element={hallMonitorView} />
                    <Route path="/rooms" element={manageRoomsView} />
                    <Route path="/users" element={manageUsersView} />
                </Routes>
            </div>
        </section>
    );

}