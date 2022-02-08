import React, { useState } from 'react'

import StudentNav from './StudentNav';
import { Pass } from '../Pass';

import './StudentView.css'

const PassStatus = {
    Departing: { displayName: "Departing", displayColor: "#FFA500" },
    AtLocation: { displayName: "At Location", displayColor: "#90ee90" },
    Returning: { displayName: "Returning", displayColor: "#ff0000" }
}

export default function StudentView({ theme, setCurrentTheme, currentUser }) {

    const [currentPass, setCurrentPass] = useState(null);
    const [passStatus, setPassStatus] = useState(PassStatus.Returning);

    return (
        <>
            <StudentNav theme={theme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />
            <div id="student-view-content">
                <div className="col">
                    <div id="current-pass" style={{backgroundColor: passStatus ? passStatus.displayColor : theme.offset}}>
                        {
                            currentPass != null ?
                            <div id="close-pass-button" style={{backgroundColor: passStatus ? passStatus.displayColor : theme.offset}}>
                                x
                            </div>
                            : 
                            null
                        }
                       
                        <div id="arrival-location-header">
                            <h1 id="arrival-location">{}</h1>
                        </div>
                        <div className="pass-info">
                            
                        </div>
                        <div id="movement-status">
                            <h1>{passStatus ? passStatus.displayName : null}</h1>
                        </div>
                    </div>
                </div>
                <div className="col">

                </div>
            </div>
        </>
    );

}