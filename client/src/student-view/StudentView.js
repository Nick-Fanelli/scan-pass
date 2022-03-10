import React, { useState, useEffect, useCallback } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRestroom, faDoorOpen } from "@fortawesome/free-solid-svg-icons"

import StudentNav from './StudentNav';
import CreateBathroomPass from './CreateBathroomPassPopup';
import { PassFactory } from '../Pass';

import { server } from '../ServerAPI';

import './StudentView.css'

const PassStatus = {
    Departing: { displayName: "Departing", displayColor: "#0390fc" },
    AtLocation: { displayName: "At Location", displayColor: "#90ee90" },
    Returning: { displayName: "Returning", displayColor: "#ff0000" }
}

export default function StudentView({ theme, setCurrentTheme, currentUser }) {

    const [seconds, setSeconds] = useState(0);

    const [isCreateBathroomPassPopupVisible, setIsCreateBathroomPassPopupVisible] = useState(false);

    const [currentPass, setCurrentPass] = useState(null);
    const [passStatus, setPassStatus] = useState(null);

    const refreshUpdate = useCallback(() => {
        // server.get('/passes/get-self-pertaining', {
        //     headers: { authorization: currentUser.accessToken }
        // }).then(res => {
        //     const passes = res.data;
        // });

        server.get('/users/get-self', {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            if(res.data.currentPass) {
                let currentPassId = res.data.currentPass;
                
                server.get('/passes/get/' + currentPassId, {
                    headers: { authorization: currentUser.accessToken }
                }).then(res => {
                    const pass = res.data;
                    if(!pass) {
                        console.error("Huh, weird error with retrieving the pass from the database...");
                        return;
                    }
                
                    if(!pass.arrivalTimestamp) {
                        if(passStatus !== PassStatus.Departing)
                            setPassStatus(PassStatus.Departing);
                    } else {
                        if(passStatus !== PassStatus.AtLocation)
                            setPassStatus(null);
                    }

                    if(!currentPass || currentPass._id !== pass._id)
                        setCurrentPass(pass);
                }).catch(error => { // If the pass doesn't exist
                    server.post('/users/set-current-pass', {
                        passID: null
                    }, {
                        headers: { authorization: currentUser.accessToken }
                    });

                    server.post('/users/purge-bathroom-passes', {}, {
                        headers: { authorization: currentUser.accessToken }
                    });

                    setPassStatus(null);
                    setCurrentPass(null);
                })

            } else {
                if(passStatus !== null)
                    setPassStatus(null);
            }
        });
    }, [currentUser.accessToken, passStatus, setPassStatus, setCurrentPass, currentPass]);

    useEffect(() => {
        let interval = null;

        interval = setInterval(refreshUpdate, 2000); // Wait 2000ms
        refreshUpdate();

        return () => clearInterval(interval);
    }, [refreshUpdate, seconds]);

    function handleEndPass() {
        server.post('/users/purge-bathroom-passes', {}, {
            headers: { authorization: currentUser.accessToken }
        }).then(() => {
            refreshUpdate();
        })
    }

    function handleCreateBathroomPass() {
        setIsCreateBathroomPassPopupVisible(true);
    }

    function handleCreateRoomPass() {

        // Create Pass
        setCurrentPass(PassFactory.CreateRoomPass(
            currentUser.userID,
            currentUser.userID,
            "A101",
            "12:00pm",
            "A102"
        ));

        setPassStatus(null);

        // Reset timer
    }

    let calculatedMinutes = Math.floor(seconds / 60);
    let calculatedSeconds = seconds - calculatedMinutes * 60;

    if(calculatedMinutes < 10) calculatedMinutes = "0" + calculatedMinutes;
    if(calculatedSeconds < 10) calculatedSeconds = "0" + calculatedSeconds;

    return (
        <>
            {
                isCreateBathroomPassPopupVisible ?
                <CreateBathroomPass currentTheme={theme} currentUser={currentUser} setIsCreateBathroomPassPopupVisible={setIsCreateBathroomPassPopupVisible} refreshUpdate={refreshUpdate} />
                : null
            }
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
                            currentPass !== null ?
                            <h1>{calculatedMinutes}:{calculatedSeconds}</h1>
                            : null
                        }
                    </div>
                    <div id="movement-status" className={(currentPass ? "box-shadow" : "") + " " + (passStatus === PassStatus.Returning ? "returning-status" : "")}>
                        <h1 className={passStatus === PassStatus.Returning ? "transform-up" : null}>{passStatus ? passStatus.displayName : null}</h1>
                        <h2 className={passStatus === PassStatus.Returning ? "transform-up" : null}>END PASS</h2>
                    </div>
                </div>
                <div id="create-pass"  className="col">
                    <div className="new-pass-btn" style={{backgroundColor: theme.offset}} onClick={handleCreateBathroomPass}>
                        <FontAwesomeIcon style={{color: theme.text}} icon={faRestroom} />
                    </div>
                    <div className="new-pass-btn" style={{backgroundColor: theme.offset}} onClick={handleCreateRoomPass}>
                        <FontAwesomeIcon style={{color: theme.text}} icon={faDoorOpen} />
                    </div>
                </div>
                <div id="past-requests" className="col">
                    
                </div>
            </div>
        </>
    );

}