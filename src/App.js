import React, { useState } from 'react'

import { Theme } from "./Theme"

import LavView from './lav-view/LavView'

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentSchool, setCurrentSchool] = useState("Williamstown Middle School");
    const [currentLav, setCurrentLav] = useState("A100");
    const [currentUserName, setCurrentUserName] = useState("First Last");

    return (
        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>
            <LavView currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} currentSchool={currentSchool} currentLav={currentLav} currentUserName={currentUserName} />
        </section> 
    );
}

export default App;
