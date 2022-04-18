import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlus, faRestroom } from "@fortawesome/free-solid-svg-icons"

import LavView from './lav-view/LavView'

import { Theme } from '../Theme';

import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'

import './TeacherView.css'

const View = {
    HomePage: "/teacher",
    LavView: "/teacher/lav-view"
}

export default function TeacherView({ currentUser, currentTheme: theme, setCurrentTheme }) {

    const navigate = useNavigate();

    function handleGoHome() {
        navigate(View.HomePage);
    }

    const lavView = <LavView currentUser={currentUser} currentTheme={theme} setCurrentTheme={setCurrentTheme} handleGoHome={handleGoHome} />

    const teacherHomePageView = (
        <section id="teacher-view">
            
            <nav id="teacher-nav" style={{backgroundColor: theme.offset}}>
                <h1 style={{color: theme.text}}>Teacher Portal</h1>
                <div className="nav-ending">
                    <h1 style={{color: theme.text}}>{currentUser.name}</h1>
                    <FontAwesomeIcon id="settings-button" style={{color: theme.text}} icon={faCog} onClick={() => setCurrentTheme(theme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)} />
                </div>
            </nav>

            <section className="content">
                <div id="controls" className="col">
                    <div className="button-control" style={{backgroundColor: theme.offset}}>
                        <FontAwesomeIcon icon={faPlus} className="fa-icon" style={{color: theme.text}} />
                        <h2 style={{color: theme.text}}>Create Pass</h2>
                    </div>
                    <Link to={View.LavView} style={{color: theme.text, textDecoration: 'none'}}>
                        <div className="button-control" style={{backgroundColor: theme.offset}}>
                            <FontAwesomeIcon icon={faRestroom} className="fa-icon" style={{color: theme.text}} />
                            <h2 style={{color: theme.text}}>Lav Duty</h2>
                        </div>
                    </Link>
                </div>
                <div id="your-passes" className="col">
                    <div className="pass-container" style={{backgroundColor: theme.offset}}>
                        <div className="header">
                            <h1 style={{color: theme.text}}>Your Passes</h1>
                        </div>
                    </div>
                </div>
            </section>

        </section>
    );

    return (
        <Routes>
            <Route path={View.HomePage} element={teacherHomePageView} />
            <Route path={View.LavView} element={lavView} />
            <Route path="*" element={<Navigate to={View.HomePage} />} />
        </Routes>
    );
}