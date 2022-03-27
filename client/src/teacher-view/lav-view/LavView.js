import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'

import { server } from '../../ServerAPI';

import './LavView.css'

import LavNav from "./LavNav"
import Lav from "./Lav"
import ExchangeLocationPopup from './ExchangeLocationPopup';

const ValidInputRegex = /[0-9]|Enter/gi;
const ValidStudentIDRegex = /^[0-9]{5}$/

var keyLog = "";

const useEventListener = (eventName, handler, element = window) => {
    const savedHandler = useRef();

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventListener = (event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);
        return () => {
        element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
};

export default function LavView({ currentUser, currentTheme, setCurrentTheme, handleGoHome }) {

    const refreshInterval = useRef();

    const [isLoaded, setIsLoaded] = useState(false);
    const [lavLocations, setLavLocations] = useState(null);

    const [activePasses, setActivePasses] = useState([]);
    const prevActivePasses = useRef();

    const [students, setStudents] = useState([]);
    const [lavLocation, setLavLocation] = useState(null);
    const [isExchangeLocationPopupOpen, setIsExchangeLocationPopupOpen] = useState(true);

    const refreshUpdate = useCallback(() => {
        async function run() {
            if(!lavLocation) return;

            server.get(`/passes/get-all-to-room/${currentUser.schoolLocation}/${lavLocation.roomLocation}`, {
                headers: { authorization: currentUser.accessToken }
            }).then(res => {
                let newActivePasses = res.data;

                if(JSON.stringify(newActivePasses) !== prevActivePasses.current) {
                    console.log("Update Passes from Database...");
                    setActivePasses(newActivePasses);
                }
            });
        }

        return run();
    }, [lavLocation, currentUser.accessToken, prevActivePasses, currentUser.schoolLocation]);
 
    // Update Prev Active Passes
    useEffect(() => {
        prevActivePasses.current = JSON.stringify(activePasses);
    }, [activePasses])

    useEffect(() => {
        async function call() {
            
            server.get('/school-locations/get', {
                headers: {
                    'authorization': currentUser.accessToken
                }
            }).then((result) => {
                if(!result.data || !result.data.roomLocations) {
                    console.error("Could not load room data from database!");
                    return;
                }

                // Get all the bathrooms
                const bathrooms = result.data.roomLocations.filter(room => {
                    return room.isBathroom;
                });

                setLavLocations(bathrooms);

                clearInterval(refreshInterval.current); // Clear the current interval
                refreshInterval.current = setInterval(refreshUpdate, 2000); // Set new refresh interval of 2000ms
                refreshUpdate();

            }); 

        }

        return call();
    }, [currentUser.accessToken, refreshUpdate, refreshInterval]);

    // Is Loaded
    useEffect(() => {
        if(lavLocations)
            setIsLoaded(true);
    }, [lavLocations]);

    // Check for exit
    useEffect(() => {
        if(!isExchangeLocationPopupOpen && !lavLocation) {
            handleGoHome();
        }
    }, [isExchangeLocationPopupOpen, lavLocation, handleGoHome]);

    async function processData(data, timestamp) {
        // Validate Student ID
        if(!data.match(ValidStudentIDRegex)) {
            console.error(`${data} is not a valid student ID number!`);
            return;
        }

        const user = await server.get('/users/lookup-student-by-student-id/' + data, {
            headers: { authorization: currentUser.accessToken }
        });

        if(!user) {
            console.error("Received Null User");
            return;
        }

        const result = activePasses.filter(pass => pass.targetID === user.userID);
    
        if(!result) {
            console.error("Invalid Student ID");
            return;
        }
        
        if(result.length > 1) {
            console.error("Result > 1???");
            return;
        }

        let targetPass = result[0];
    
        if(targetPass.arrivalTimestamp === null) {
            // Set Arrival Location
            server.post("/passes/set-arrival-timestamp/" + targetPass._id,
            {
                arrivalTimestamp: timestamp
            },
            {
                headers: { authorization: currentUser.accessToken }
            }).then(() => {
                refreshUpdate();
            });
        } else {
            server.post('/passes/end-pass/' + targetPass._id, {}, {
                headers: { authorization: currentUser.accessToken }
            }).then(() => {

                // Create New Reversal Pass
                server.post('passes/create-pass/', {
                    studentID: targetPass.studentID,
                    departureLocation: { roomLocation: targetPass.arrivalLocation },
                    departureTimestamp: Date.now(),
                    arrivalLocation: { roomLocation: targetPass.departureLocation }
                }, {
                    headers: { authorization: currentUser.accessToken }
                }).then(res => {
                    server.post(`users/set-current-pass/${targetPass.studentID}`, {
                        passID: res.data._id
                    }, {
                        headers: { authorization: currentUser.accessToken }
                    }).then(res => {
                        console.log(res);
                    });
                });

                refreshUpdate();
            });
        }
    }

    function handleClearAllStudents() {
        
        let result = window.confirm("Are you sure you want to end all the current bathroom passes?");

        if(result) {
            setStudents([]);
            // TODO: Update in database by ending all passes
        }
    }

    function handleManuallyAddStudent() {
        const idPrompt = window.prompt("Enter Student ID");

        if(idPrompt)
            processData(idPrompt, Date.now());
    }

    // Key Press Handler
    const handler = ({ key }) => {
        if(key.match(ValidInputRegex)) {
            if(key === "Enter") {
                if(keyLog.trim()) {
                    processData(keyLog, Date.now());
                    keyLog = "";
                }
            } else {
                keyLog += key;
            }
        }
    };
    
    useEventListener("keydown", handler);

    // On Component Unmount
    useLayoutEffect(() => {
        return () => {
            clearInterval(refreshInterval.current); // Clear Interval
        }
    }, [refreshInterval]);

    if(isLoaded) {
        return (
            <>
                {
                    isExchangeLocationPopupOpen || lavLocation == null ? 
                    <ExchangeLocationPopup theme={currentTheme} setIsExchangeLocationPopupOpen={setIsExchangeLocationPopupOpen} lavLocations={lavLocations} setLavLocation={setLavLocation} /> :
                    null
                }

                {
                lavLocation != null ?

                <>
                <LavNav theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} studentCount={activePasses.filter(pass => pass.arrivalTimestamp).length} lavLocation={lavLocation.roomLocation} setIsExchangeLocationPopupOpen={setIsExchangeLocationPopupOpen} handleGoHome={handleGoHome} />
                <Lav theme={currentTheme} currentUser={currentUser} students={students} processData={processData} activePasses={activePasses} />
                <div id="button-controls">
                    <div className="button-wrapper">
                        <button style={{backgroundColor: currentTheme.offset, color: currentTheme.text}} onClick={handleManuallyAddStudent}>Manually Add Student</button>
                        <button style={{backgroundColor: currentTheme.offset, color: currentTheme.text}} onClick={handleClearAllStudents}>Clear All Students</button>
                    </div>
                </div>
                </>

                : null
                }
            </>
        );
    } else {
        return null; // TODO: Loading Screen
    }
}