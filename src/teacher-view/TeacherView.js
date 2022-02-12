import React, { useState } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog, faPlus, faRestroom } from "@fortawesome/free-solid-svg-icons"

import LavView from './lav-view/LavView'

import { Theme } from '../Theme';

import './TeacherView.css'

const TeacherViewState = {
    HomePage: "Home Page",
    LavView: "Lav View"
}

export default function TeacherView({ currentUser, currentTheme: theme, setCurrentTheme }) {

    const [currentState, setCurrentState] = useState(TeacherViewState.HomePage);

    function handleGoHome() {
        setCurrentState(TeacherViewState.HomePage);
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
                    <div className="button-control" style={{backgroundColor: theme.offset}} onClick={() => setCurrentState(TeacherViewState.LavView)}>
                        <FontAwesomeIcon icon={faRestroom} className="fa-icon" style={{color: theme.text}} />
                        <h2 style={{color: theme.text}}>Lav Duty</h2>
                    </div>
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

    let returnState = null;
    switch(currentState) {
        case TeacherViewState.HomePage:
            returnState = teacherHomePageView;
            break;
        case TeacherViewState.LavView:
            returnState = lavView;
            break;
        default:
            returnState = teacherHomePageView;
            break;
    }

    return returnState;
}