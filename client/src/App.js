import React, { useEffect, useState } from 'react';

import { UserType } from "./User";
import { Theme, THEME_LOCAL_STORAGE_KEY } from "./Theme"

import LoginView from './LoginView'

import DistrictAdminView from './district-admin-view/DistrictAdminView';
import StudentView from './student-view/StudentView';
import TeacherView from './teacher-view/TeacherView';

import './Defaults.css'

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentUser, setCurrentUser] = useState(null);

    // Load Theme
    useEffect(() => {
        const theme = JSON.parse(localStorage.getItem(THEME_LOCAL_STORAGE_KEY));
        if(theme) setCurrentTheme(JSON.stringify(theme) === JSON.stringify(Theme.LightTheme) ? Theme.LightTheme : Theme.DarkTheme);
    }, []); 

    // Save Theme
    useEffect(() => {
        localStorage.setItem(THEME_LOCAL_STORAGE_KEY, JSON.stringify(currentTheme));
    }, [currentTheme]);

    // Set View
    const districtAdminView = <DistrictAdminView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
    const teacherView = <TeacherView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
    const studentView = <StudentView theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />    

    let currentView = <LoginView currentTheme={currentTheme} setCurrentUser={setCurrentUser} />;
    if(currentUser) {
        switch(currentUser.userType) {
            case UserType.Admin:
                break;
            case UserType.DistrictAdmin:
                currentView = districtAdminView;
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
    }

    return (
        <>
            <section id="background" style={{backgroundColor: currentTheme.backgroundColor}}></section>
            <section id="content-wrapper">
                {currentView}
            </section>
        </>
    );
}

export default App;
