import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faClock, faArrowDown } from "@fortawesome/free-solid-svg-icons"

import StudentNav from './StudentNav';
import CreateBathroomPass from './CreatePassPopup';

import { server } from '../ServerAPI';

import './StudentView.css'
import MiniPass from './MiniPass';

const PassStatus = {
    Departing: { displayName: "Departing", displayColor: "#0390fc" },
    AtLocation: { displayName: "At Location", displayColor: "#90ee90" },
    Returning: { displayName: "Returning", displayColor: "#ff0000" }
}

export default function StudentView({ theme: currentTheme, setCurrentTheme, currentUser }) {

    const refreshInterval = useRef();

    const [seconds, setSeconds] = useState(0);

    const [isCreateBathroomPassPopupVisible, setIsCreateBathroomPassPopupVisible] = useState(false);

    const [currentPass, setCurrentPass] = useState(null);
    const [assignedPasses, setAssignedPasses] = useState([]);

    const assignedPassesStringified = useRef();

    const refreshUpdate = useCallback(() => {
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
                
                    if(!currentPass || currentPass._id !== pass._id)
                        setCurrentPass(pass);
                }).catch(() => { // If the pass doesn't exist
                    console.error("Users Current Pass Doesn't Exist");

                    server.post('/users/set-current-pass', {
                        passID: null
                    }, {
                        headers: { authorization: currentUser.accessToken }
                    });

                    server.post('/users/purge-bathroom-passes', {}, {
                        headers: { authorization: currentUser.accessToken }
                    });

                    setCurrentPass(null);
                });
            } else {
                if(currentPass !== null)
                    setCurrentPass(null);
            }
        });

        server.get('/passes/get-self-pertaining', {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            const resStringified = JSON.stringify(res.data);
            if(resStringified !== assignedPassesStringified.current) {
                assignedPassesStringified.current = resStringified;
                setAssignedPasses(res.data.sort((a, b) => (a.departureTimestamp > b.departureTimestamp) ? 1 : -1));
            }
        })
    }, [currentUser.accessToken, setCurrentPass, currentPass, assignedPassesStringified, setAssignedPasses]);

    useEffect(() => {
        
        clearInterval(refreshInterval.current); // Clear refresh interval
        refreshInterval.current = setInterval(refreshUpdate, 2000); // Set refresh interval to 2000ms

        refreshUpdate();
    }, [refreshUpdate, seconds, refreshInterval]);

    function handleEndPass() {
        server.post('/passes/end-pass/' + currentPass._id, {}, {
            headers: { authorization: currentUser.accessToken }
        }).then(() => {
            refreshUpdate();
        });
    }

    function handleCreateBathroomPass() {
        setIsCreateBathroomPassPopupVisible(true);
    }

    // On Component Unmount
    useLayoutEffect(() => {
        return () => {
            clearInterval(refreshInterval.current);
        }
    }, [refreshInterval])

    let calculatedMinutes = Math.floor(seconds / 60);
    let calculatedSeconds = seconds - calculatedMinutes * 60;

    if(calculatedMinutes < 10) calculatedMinutes = "0" + calculatedMinutes;
    if(calculatedSeconds < 10) calculatedSeconds = "0" + calculatedSeconds;

    const currentPassStatus = (currentPass && currentPass.arrivalTimestamp) ? PassStatus.AtLocation : PassStatus.Departing;

    return (
        <>
            {
                currentPass !== null ?
                <section id="current-pass">
                    <div className="pass" style={{backgroundColor: currentPassStatus.displayColor}}>
                        <h1>{currentPassStatus.displayName}</h1>

                        <div className="locations">
                            <h2>{currentPass.departureLocation}</h2>
                            <FontAwesomeIcon icon={faArrowDown} className="icon" />
                            <h2>{currentPass.arrivalLocation}</h2>
                        </div>

                        <div className="end-pass-btn" onClick={handleEndPass}>
                            <h2>End Pass</h2>
                        </div>
                    </div>
                </section>
                : null   
            }
            {
                isCreateBathroomPassPopupVisible && currentPass === null ?
                <CreateBathroomPass currentTheme={currentTheme} currentUser={currentUser} setIsCreateBathroomPassPopupVisible={setIsCreateBathroomPassPopupVisible} refreshUpdate={refreshUpdate} />
                : null
            }
            <StudentNav theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} />
            <section id="student-view-context">
                <div className="col" id="left-col">
                    <h1 style={{color: currentTheme.text}}>Your Passes</h1>
                    <div id="your-passes-container" style={{backgroundColor: currentTheme.offset}}>
                        {
                            assignedPasses.map(pass => {
                                return <MiniPass currentTheme={currentTheme} pass={pass} key={pass._id} />
                            })
                        }
                    </div>
                </div>
                <div className="col" id="right-col">
                    <div id="create-pass-now-btn" style={{backgroundColor: currentTheme.offset}} onClick={handleCreateBathroomPass}>
                        <FontAwesomeIcon icon={faPlus} className="icon" style={{color: currentTheme.text}} />
                        <h2 style={{color: currentTheme.text}}>Now</h2>
                    </div>
                    <div id="create-pass-future-btn" style={{backgroundColor: currentTheme.offset}}>
                        <FontAwesomeIcon icon={faClock} className="icon" style={{color: currentTheme.text}} />
                        <h2 style={{color: currentTheme.text}}>Future</h2>
                    </div>
                </div>
            </section>
        </>
    );

}