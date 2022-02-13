import React, { useEffect, useState } from 'react';

import { User, SchoolLocations, UserType } from "./User";
import { Theme, THEME_LOCAL_STORAGE_KEY } from "./Theme"

import StudentView from './student-view/StudentView';
import TeacherView from './teacher-view/TeacherView';
import LoginView from './LoginView';

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentUser, setCurrentUser] = useState(null);
    // const [currentUser, setCurrentUser] = useState(new User(UserType.Teacher, "45563", "nfanelli@monroetwp.k12.nj.us", "Nick Fanelli", SchoolLocations.WHS));

    // Load Theme
    useEffect(() => {
        const theme = JSON.parse(localStorage.getItem(THEME_LOCAL_STORAGE_KEY));
        if(theme) setCurrentTheme(theme);
    }, []); 

    // Save Theme
    useEffect(() => {
        localStorage.setItem(THEME_LOCAL_STORAGE_KEY, JSON.stringify(currentTheme));
    }, [currentTheme]);

    // Set View
    const loginView = <LoginView setCurrentUser={setCurrentUser} />
    const teacherView = <TeacherView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
    const studentView = <StudentView theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />

    let currentView = null;
    if(currentUser) {
        switch(currentUser.userType) {
            case UserType.Admin:
                break;
            case UserType.Student:
                currentView = studentView;
                break;
            case UserType.Teacher:
                currentView = teacherView;
                break;
            default:
                break;
        }
    } else {
        currentView = loginView;
    }

    return (

        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>

            {currentView}

        </section>
    );
}

export default App;
