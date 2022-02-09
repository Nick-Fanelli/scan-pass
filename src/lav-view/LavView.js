import React, { useState, useEffect, useRef } from 'react'

import './LavView.css'

import LavNav from "./LavNav"
import Lav from "./Lav"
import ExchangeLocationPopup from './ExchangeLocationPopup';

import { UserLocation } from '../User';

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


export default function LavView({ currentTheme, setCurrentTheme, currentUser }) {

    const [students, setStudents] = useState([]);
    const [lavLocation, setLavLocation] = useState(UserLocation.WHS.lavLocations[0]);
    const [isExchangeLocationPopupOpen, setIsExchangeLocationPopupOpen] = useState(false);

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

    return (
        <>
            <LavNav theme={currentTheme} setCurrentTheme={setCurrentTheme} currentUser={currentUser} studentCount={students.length} lavLocation={lavLocation} setIsExchangeLocationPopupOpen={setIsExchangeLocationPopupOpen} />
            <Lav theme={currentTheme} students={students} processData={processData} />
            {
                isExchangeLocationPopupOpen ? 
                <ExchangeLocationPopup theme={currentTheme} setIsExchangeLocationPopupOpen={setIsExchangeLocationPopupOpen} schoolLocation={currentUser.userLocation} setLavLocation={setLavLocation} /> :
                null
            }
            <div id="button-controls">
                <div className="button-wrapper">
                    <button style={{backgroundColor: currentTheme.offset, color: currentTheme.text}}>Manually Add Student</button>
                    <button style={{backgroundColor: currentTheme.offset, color: currentTheme.text}} onClick={handleClearAllStudents}>Clear All Students</button>
                </div>
            </div>
        </>
    );

}