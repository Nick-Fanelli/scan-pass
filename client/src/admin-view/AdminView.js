import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine, faDoorClosed, faIdBadge } from "@fortawesome/free-solid-svg-icons";

import ThemeToggleButton from "../ThemeToggleButton";
import HallMonitorView from "../hall-monitor-view/HallMonitorView";

import LavView from '../teacher-view/lav-view/LavView';

import './AdminView.css'

const View = {
    Dashboard: "dashboard",
    HallMonitor: "hall-monitor",
    LavDuty: "lav-duty"
}

export default function AdminView({ currentTheme, setCurrentTheme, currentUser }) {

    const currentView = useLocation().pathname.split('/').slice(-1)[0];

    return (
        <section id="admin-view">
            <div id="sidebar" style={{backgroundColor: currentTheme.offset}}>
                <ul style={{color: currentTheme.text}}>
                    <div className="controls">
                        <h1>{currentUser.name}</h1>
                        <ThemeToggleButton currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
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
                    <Link to={View.LavDuty} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.LavDuty ? "active" : null}>
                            <p>Lav Duty<FontAwesomeIcon className="icon" icon={faDoorClosed} /></p>
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
                    <Route path={View.LavDuty} element={<LavView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />} />
                </Routes>
            </div>
        </section>
    )

}