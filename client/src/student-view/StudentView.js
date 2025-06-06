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
    Returning: { displayName: "Returning", displayColor: "#eb4034" }
}

export default function StudentView({ theme: currentTheme, setCurrentTheme, currentUser }) {

    const refreshInterval = useRef();
    const setSecondRefreshInterval = useRef();

    const [seconds, setSeconds] = useState(0);

    const [isCreateBathroomPassPopupVisible, setIsCreateBathroomPassPopupVisible] = useState(false);

    const [currentPass, setCurrentPass] = useState(null);
    const [assignedPasses, setAssignedPasses] = useState([]);

    const currentPassStringified = useRef();
    const assignedPassesStringified = useRef();
    const bathroomLocations = useRef();

    const refreshUpdate = useCallback(() => {

        let shouldCancel = false;

        const call = async () => {
            // Get self passes
            const selfPasses = await server.get(`/passes/get-self-pertaining`, {
                headers: { authorization: currentUser.accessToken }
            });
            if(shouldCancel) return;

            // Get Self
            const self = await server.get(`/users/get-self`, {
                headers: { authorization: currentUser.accessToken }
            });
            if(shouldCancel) return;

            let targetCurrentPass = null;

            selfPasses.data.forEach(pass => {
                if(pass._id === self.data.currentPass) {
                    targetCurrentPass = pass;
                    return;
                }
            });

            const stringifiedTempTargetCurrentPass = JSON.stringify(targetCurrentPass);

            if(currentPassStringified.current !== stringifiedTempTargetCurrentPass) {
                currentPassStringified.current = stringifiedTempTargetCurrentPass;

                setCurrentPass(targetCurrentPass);
            }

            const stringifiedPasses = JSON.stringify(selfPasses.data);

            if(assignedPassesStringified.current === stringifiedPasses) {
                return;
            }

            assignedPassesStringified.current = stringifiedPasses;
            setAssignedPasses(selfPasses.data);
        }

        call();
        return () => { shouldCancel = true; }
        
    }, [currentUser.accessToken, assignedPassesStringified, setAssignedPasses]);

    // On Load
    useEffect(() => {
        // Get all the bathroom locations
        server.get('/school-locations/get', {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            let rawBathroomLocations = res.data.roomLocations.filter(room => room.isBathroom);

            bathroomLocations.current = [];

            rawBathroomLocations.forEach(bathroom => {
                bathroomLocations.current.push(bathroom.roomLocation);
            });
        });
        
        clearInterval(refreshInterval.current); // Clear refresh interval
        refreshInterval.current = setInterval(refreshUpdate, 2000); // Set refresh interval to 2000ms

        return refreshUpdate();
    }, [refreshUpdate, seconds, refreshInterval, currentUser.accessToken]);

    const updateSeconds = useCallback(() => {
        if(!currentPass.arrivalTimestamp) {

            // const passTime = new Date(Number.parseInt(currentPass.departureTimestamp)).getTime();
            const difference = (Date.now() - currentPass.departureTimestamp) / 1000;

            setSeconds(difference);
        } else {
            setSeconds((Date.now() - currentPass.arrivalTimestamp) / 1000);
        }
    }, [currentPass, setSeconds]);

    useEffect(() => {
        clearInterval(setSecondRefreshInterval.current);

        if(currentPass != null) {
            setSeconds(0);
            setSecondRefreshInterval.current = setInterval(updateSeconds, 1000); // 900ms
        }
    }, [currentPass, updateSeconds]);

    const startPass = (pass) => {
        console.log(pass);
    }

    function handleEndPass() {
        server.post('/passes/end-pass/' + currentPass._id, {}, {
            headers: { authorization: currentUser.accessToken }
        }).then(() => {
            return refreshUpdate();
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
    }, [refreshInterval]);

    let calculatedMinutes = Math.floor(seconds / 60);
    let calculatedSeconds = Number.parseInt(seconds - calculatedMinutes * 60);

    if(calculatedMinutes < 10) calculatedMinutes = "0" + calculatedMinutes;
    if(calculatedSeconds < 10) calculatedSeconds = "0" + calculatedSeconds;

    const calculateCurrentPassStatus = () => {
        if(!currentPass) return null;

        if(bathroomLocations.current.includes(currentPass.departureLocation))
            return PassStatus.Returning;
        if(!currentPass.arrivalTimestamp)
            return PassStatus.Departing;
        else
            return PassStatus.AtLocation;
    }

    const currentPassStatus = calculateCurrentPassStatus();

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
                        <h2>{calculatedMinutes}:{calculatedSeconds} - End Pass</h2>
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
                            return <MiniPass currentTheme={currentTheme} pass={pass} key={pass._id} startPassCallback={startPass} />
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