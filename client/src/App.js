import React, { useEffect, useState } from 'react';

import { User, SchoolLocations, UserType } from "./User";
import { Theme, THEME_LOCAL_STORAGE_KEY } from "./Theme"

import { server } from './ServerAPI';

import LoginView from './LoginView'

import StudentView from './student-view/StudentView';
import TeacherView from './teacher-view/TeacherView';

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentUser, setCurrentUser] = useState(null);

    // Load Theme
    useEffect(() => {
        const theme = JSON.parse(localStorage.getItem(THEME_LOCAL_STORAGE_KEY));
        if(theme) setCurrentTheme(theme);
    }, []); 

    // Save Theme
    useEffect(() => {
        localStorage.setItem(THEME_LOCAL_STORAGE_KEY, JSON.stringify(currentTheme));
    }, [currentTheme]);

    // On User Change
    // useEffect(() => {

    //     if(!currentUser)
    //         return;

    //     // Get all school locations
    //     const schoolLocations = server.get('/school-locations/get/' + currentUser.databaseAuth).then((result) => {
    //         console.log(result);
    //     });

    // }, [currentUser])

    // Set View
    const teacherView = <TeacherView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
    const studentView = <StudentView theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />    

    let currentView = <LoginView currentTheme={currentTheme} setCurrentUser={setCurrentUser} />;
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
    }

    return (

        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>
            {currentView}
        </section>
    );
}

export default App;
