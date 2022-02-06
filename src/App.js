import React, { useState, useEffect, useRef } from 'react'

import './App.css';

import { Theme } from "./Theme"

import Nav from './nav/Nav'
import Lav from './lav-view/Lav'

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
  

function App() {
    const [currentTheme, setCurrentTheme] = useState(Theme.LightTheme);
    const [currentSchool, setCurrentSchool] = useState("Williamstown Middle School");
    const [currentLav, setCurrentLav] = useState("A100");
    const [currentUserName, setCurrentUserName] = useState("First Last");

    const [students, setStudents] = useState([]);

    function addStudent(student) {
        setStudents(prevStudents => {
            return [...prevStudents, student]
        });
    }

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
        <section id="content-wrapper" style={{backgroundColor: currentTheme.backgroundColor}}>
            <Nav theme={currentTheme} setCurrentTheme={setCurrentTheme} currentSchool={currentSchool} currentLav={currentLav} currentUserName={currentUserName} studentCount={students.length} />
            <Lav theme={currentTheme} students={students} processData={processData} />
        </section>
    );
}

export default App;
