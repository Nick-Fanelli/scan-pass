import React, { useState } from 'react'

import { User, UserLocation } from "./User"
import { Theme } from "./Theme"

import LavView from './lav-view/LavView'

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentUser, setCurrentUser] = useState(new User("nfanelli@monroetwp.k12.nj.us", "Nick Fanelli", UserLocation.WHS));

    // Set View
    const view = currentUser != null ? <LavView currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} /> : null;

    return (
        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>
            {view}
        </section> 
    );
}

export default App;
