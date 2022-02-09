import React, { useState, useEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRestroom, faDoorOpen } from "@fortawesome/free-solid-svg-icons"

import StudentNav from './StudentNav';
import { Pass } from '../Pass';

import './StudentView.css'

const PassStatus = {
    Departing: { displayName: "Departing", displayColor: "#FFA500" },
    AtLocation: { displayName: "At Location", displayColor: "#90ee90" },
    Returning: { displayName: "Returning", displayColor: "#ff0000" }
}

export default function StudentView({ theme, setCurrentTheme, currentUser }) {

    const [seconds, setSeconds] = useState(0);
    const [isTimerActive, setTimerActive] = useState(false);

    const [currentPass, setCurrentPass] = useState(null);
    const [passStatus, setPassStatus] = useState(null);

    function resetTimer() {
        setTimerActive(true);
        setSeconds(0);
    }

    useEffect(() => {
        let interval = null;

        if(isTimerActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000); // Wait 1000ms
        } else if(!isTimerActive && seconds !== 0) {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isTimerActive, seconds]);

    function handlePassShift() {
        if(passStatus === PassStatus.Departing) {
            setPassStatus(PassStatus.AtLocation);
            resetTimer();
        } else if(passStatus === PassStatus.AtLocation) {
            setPassStatus(PassStatus.Returning);
            resetTimer();
        } else if(passStatus === PassStatus.Returning) {
            setPassStatus(null); // End Pass Status
            setCurrentPass(null); // End Pass
            setTimerActive(false); // Stop Timer
        }

        // TODO: Update the database
    }

    function handleEndPass() {
        // End pass
        setCurrentPass(null);
        setPassStatus(null);
        setTimerActive(false);

        // TODO: Update the database
    }

    function handleCreateBathroomPass() {
        // Create Pass
        setCurrentPass(new Pass(
            "Nick Fanelli",
            "45563",
            "C201",
            "12:00pm",
            "C200 Lav",
            "12:05pm"
        ));

        // Set Status TODO: Make automatic
        setPassStatus(PassStatus.Departing);

        // Reset Timer
        resetTimer();

    }

    let calculatedMinutes = Math.floor(seconds / 60);
    let calculatedSeconds = seconds - calculatedMinutes * 60;

    if(calculatedMinutes < 10) calculatedMinutes = "0" + calculatedMinutes;
    if(calculatedSeconds < 10) calculatedSeconds = "0" + calculatedSeconds;

    return (
        <>
            <StudentNav theme={theme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />
            <div id="student-view-content"  className="col">
                <div id="current-pass" style={{backgroundColor: passStatus ? passStatus.displayColor : theme.offset}}>
                    {
                        currentPass != null && passStatus !== PassStatus.Returning ?
                        <div id="close-pass-button" style={{backgroundColor: passStatus ? passStatus.displayColor : theme.offset}}
                        onClick={(e) => handleEndPass()}>
                            x
                        </div>
                        : 
                        null
                    }
                    
                    <div id="arrival-location-header" className={currentPass ? "box-shadow" : null}>
                        <h1 id="arrival-location">{currentPass ? currentPass.arrivalLocation : null}</h1>
                    </div>
                    <div className="pass-info">
                        {
                            isTimerActive ? 
                            <h1>{calculatedMinutes}:{calculatedSeconds}</h1> :
                            null
                        }
                    </div>
                    <div id="movement-status" className={(currentPass ? "box-shadow" : "") + " " + (passStatus === PassStatus.Returning ? "returning-status" : "")} onClick={(e) => handlePassShift()}>
                        <h1 className={passStatus === PassStatus.Returning ? "transform-up" : null}>{passStatus ? passStatus.displayName : null}</h1>
                        <h2 className={passStatus === PassStatus.Returning ? "transform-up" : null}>END PASS</h2>
                    </div>
                </div>
                <div id="create-pass"  className="col">
                    <div className="new-pass-btn" style={{backgroundColor: theme.offset}} onClick={handleCreateBathroomPass}>
                        <FontAwesomeIcon style={{color: theme.text}} icon={faRestroom} />
                    </div>
                    <div className="new-pass-btn" style={{backgroundColor: theme.offset}}>
                        <FontAwesomeIcon style={{color: theme.text}} icon={faDoorOpen} />
                    </div>
                </div>
                <div id="past-requests" className="col">
                    
                </div>
            </div>
        </>
    );

}