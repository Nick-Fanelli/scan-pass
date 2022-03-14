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

            server.get('/school-locations/get-bathroom-passes/' + lavLocation, {
                headers: { authorization: currentUser.accessToken }
            }).then(res => {
                let newActivePasses = res.data;

                if(JSON.stringify(newActivePasses) !== prevActivePasses.current) {
                    console.log("Update Passes From Database...");
                    setActivePasses(newActivePasses);
                }
            });
        }

        return run();
    }, [lavLocation, currentUser.accessToken, prevActivePasses]);
 
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
                setLavLocations(result.data.bathroomLocations);

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

    function processData(data, timestamp) {
        // Validate Student ID
        if(!data.match(ValidStudentIDRegex)) {
            console.error(`${data} is not a valid student ID number!`);
            return;
        }

        let studentArrayLocation = null;

        // Loop through list of current students
        for(let i = 0; i < students.length; i++) {
            let student = students[i];

            if(student.id === data) {
                studentArrayLocation = i;
                break;
            }
        }

        if(studentArrayLocation == null) { // Add Student
            setStudents([...students, { id: data, name: "First Last", loginTimestamp: timestamp}]);
            // TODO: Record in database
        } else { // Remove Student
            const prevStudents = students;
            prevStudents.splice(studentArrayLocation, 1);
            setStudents([...prevStudents]);
            // TODO: Record in database
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
                <LavNav theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} studentCount={activePasses.length} lavLocation={lavLocation} setIsExchangeLocationPopupOpen={setIsExchangeLocationPopupOpen} handleGoHome={handleGoHome} />
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