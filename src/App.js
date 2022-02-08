import React, { useEffect, useState } from 'react'

import { User, UserLocation } from "./User"
import { Theme, THEME_LOCAL_STORAGE_KEY } from "./Theme"

import LavView from './lav-view/LavView'
import StudentView from './student-view/StudentView'

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
    const view = currentUser != null ? <LavView currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} /> : null;

    const studentView = <StudentView theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />

    return (
        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>
            {studentView}
        </section>
    );
}

export default App;
