import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faDoorOpen, faIdBadge, faPassport, faRestroom } from "@fortawesome/free-solid-svg-icons"

import LavView from './lav-view/LavView'
import HallMonitorView from '../hall-monitor-view/HallMonitorView';

import { Theme } from '../Theme';

import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom'

import './TeacherView.css'

const View = {
    MyRoom: "my-room",
    MyPasses: "my-passes",
    HallMonitor: "hall-monitor",
    LavView: "lav-view"
}

export default function TeacherView({ currentUser, currentTheme, setCurrentTheme }) {

    const currentView = useLocation().pathname.split('/').slice(-1)[0]; // Get the last section of url

    return (
        <section id="teacher-view">
            <div id="sidebar" style={{backgroundColor: currentTheme.offset}}>
                <ul style={{color: currentTheme.text}}>
                    <div className="controls">
                        <h1>{currentUser.name}</h1>
                        <FontAwesomeIcon id="settings-button" icon={faCog} style={{color: currentTheme.text}} 
                        onClick={() => setCurrentTheme(currentTheme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)}/>
                    </div>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <Link to={View.MyRoom} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.MyRoom ? "active" : null}>
                            <p>My Room<FontAwesomeIcon className="icon" icon={faDoorOpen} /></p>
                        </li>
                    </Link>
                    <Link to={View.MyPasses} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.MyPasses ? "active" : null}>
                            <p>My Passes<FontAwesomeIcon className="icon" icon={faPassport} /></p>
                        </li>
                    </Link>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <Link to={View.HallMonitor} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.HallMonitor ? "active" : null}>
                            <p>Hall Monitor<FontAwesomeIcon className="icon" icon={faIdBadge} /></p>
                        </li>
                    </Link>
                    <Link to={View.LavView} style={{textDecoration: 'none', color: currentTheme.text}}>
                        <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.LavView ? "active" : null}>
                            <p>Lav Duty<FontAwesomeIcon className="icon" icon={faRestroom} /></p>
                        </li>
                    </Link>
                </ul>
            </div>
            <div id="sidebar-offset"></div>
            <div className="content">
                <Routes>
                    <Route path="/" element={<Navigate to={View.MyRoom} />} />
                    <Route path={View.MyRoom} element={null} />
                    <Route path={View.MyPasses} element={null} />
                    <Route path={View.HallMonitor} element={<HallMonitorView currentUser={currentUser} currentTheme={currentTheme} />} />
                    <Route path={View.LavView} element={<LavView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />} />
                </Routes>
            </div>
        </section>
    );
}