import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faIdBadge, faDoorClosed, faCog, faUser } from '@fortawesome/free-solid-svg-icons';

import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom"

import { Theme } from '../Theme';

import './DistrictAdminView.css'

import ManageRoomsView from './views/ManageRoomsView'
import ManageUsersView from './views/ManageUsersView';
import HallMonitorView from '../hall-monitor-view/HallMonitorView';

const View = {
    Dashboard: "dashboard",
    HallMonitor: "hall-monitor",
    Rooms: "rooms",
    Users: "users"
}

export default function DistrictAdminView({ currentUser, currentTheme, setCurrentTheme }) {

    const currentView = useLocation().pathname.split('/').slice(-1)[0]; // Get the last section of url

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
                    <Link to={View.Dashboard} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.Dashboard ? "active" : null}>
                            <p>Dashboard<FontAwesomeIcon className="icon" icon={faChartLine} /></p>
                        </li>
                    </Link>
                    <Link to={View.HallMonitor} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.HallMonitor ? "active" : null}>
                            <p>Hall Monitor<FontAwesomeIcon className="icon" icon={faIdBadge} /></p>
                        </li>
                    </Link>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <Link to={View.Rooms} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.Rooms ? "active" : null}>
                            <p>Rooms<FontAwesomeIcon className="icon" icon={faDoorClosed} /></p>
                        </li>
                    </Link>
                    <Link to={View.Users} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset, color: currentTheme.text}} className={currentView === View.Users ? "active" : null}>
                            <p>Users<FontAwesomeIcon className="icon" icon={faUser} /></p>
                        </li>
                    </Link>
                </ul>
            </div>
            <div id="sidebar-offset"></div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Navigate to={View.Dashboard} />}></Route>
                    <Route path={View.Dashboard} element={null} />
                    <Route path={View.HallMonitor} element={<HallMonitorView currentUser={currentUser} currentTheme={currentTheme} />} />
                    <Route path={View.Rooms} element={<ManageRoomsView currentUser={currentUser} currentTheme={currentTheme} />} />
                    <Route path={View.Users} element={<ManageUsersView currentUser={currentUser} currentTheme={currentTheme} />} />
                </Routes>
            </div>
        </section>
    );

}