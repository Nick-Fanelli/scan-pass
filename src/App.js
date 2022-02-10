import React, { useEffect, useState } from 'react'

import { User, UserLocation } from "./User"
import { Theme, THEME_LOCAL_STORAGE_KEY } from "./Theme"

import StudentView from './student-view/StudentView'
import TeacherView from './teacher-view/TeacherView'

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentUser, setCurrentUser] = useState(new User("nfanelli@monroetwp.k12.nj.us", "Nick Fanelli", UserLocation.WHS));

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
    const teacherView = <TeacherView currentUser={currentUser} currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
    const studentView = <StudentView theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />

    return (
        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>
            {teacherView}
        </section>
    );
}

export default App;
