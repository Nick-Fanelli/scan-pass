import { useEffect, useState, useRef, useCallback } from 'react';

import { server } from '../../ServerAPI';

import EditRoomPopup from './EditRoomPopup';
import ImportCSVPopup from './ImportCSVPopup';
import Room from './Room'

import './ManageRoomsView.css'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';

export default function DAManageRoomsView({ currentUser, currentTheme }) {

    const [schoolLocations, setSchoolLocations] = useState(null);
    const [currentSchoolLocationIndex, setCurrentSchoolLocationIndex] = useState(0);

    const [shouldShowAddRoomPopup, setShouldShowAddRoomPopup] = useState(false);
    const [shouldShowImportCSVPopup, setShouldShowImportCSVPopup] = useState(false);

    const [targetRoom, setTargetRoom] = useState(null);

    const schoolSelectRef = useRef(null);

    const syncWithDatabase = useCallback(() => {
        let shouldCancel = false;

        server.get('/school-locations/get-all', {
            headers: { authorization: currentUser.accessToken }
        }).then((result) => {
            if(shouldCancel)
                return;

            if(!result) {
                console.error("Load School Locations: Fail");
                return;
            }

            // Sort Room Data
            let schoolLocationsCopy = result.data;

            schoolLocationsCopy.forEach((school) => {
                let bathrooms = [];
                let rooms = [];

                school.roomLocations.forEach((room) => {
                    room.isBathroom ? bathrooms.push(room) : rooms.push(room);
                });

                bathrooms.sort((a, b) => (a.roomLocation > b.roomLocation) ? 1 : -1);
                rooms.sort((a, b) => (a.roomLocation > b.roomLocation) ? 1 : -1);

                school.roomLocations = [...bathrooms.concat(rooms)];
            });

            setSchoolLocations([...schoolLocationsCopy]);
        });

        return () => { shouldCancel = true; }
    }, [currentUser.accessToken]);

    // Load School Locations
    useEffect(() => {
        return syncWithDatabase();
    }, [currentUser.databaseAuth, syncWithDatabase]);

    function handleUpdateRooms() {
        setCurrentSchoolLocationIndex(schoolSelectRef.current.selectedIndex);
    }

    function handleAddRoom() {
        setTargetRoom(null);
        setShouldShowAddRoomPopup(true);
    }

    function handleEditRoom(room) {
        setTargetRoom(room);
        setShouldShowAddRoomPopup(true);
    }

    function handleImportData() {
        setShouldShowImportCSVPopup(true);
    }

    function handleImportCSVData(data) {

        const currentSchoolLocation = schoolLocations[currentSchoolLocationIndex]._id;

        data.forEach((entry) => {

            const roomName = entry[0];
            const isBathroom = entry[1] === "true" ? true : false;
            const isStudentAccessible = entry[2] === "true" ? true : false;

            server.post('/school-locations/add-room', {
                schoolLocationID: currentSchoolLocation,
                roomLocation: roomName,
                isBathroom: isBathroom,
                isStudentAccessible: isStudentAccessible
            }, {
                headers: { authorization: currentUser.accessToken }
            });

        });

        syncWithDatabase();
    }

    if(shouldShowAddRoomPopup && shouldShowImportCSVPopup) {
        setShouldShowAddRoomPopup(false);
        setShouldShowImportCSVPopup(false);
    }

    return (
        <>
        {
            shouldShowImportCSVPopup ?
            <ImportCSVPopup currentTheme={currentTheme} importFormat={"Room Location (String), Is Bathroom (boolean), Is Student Accessible (boolean)"} setShouldShowImportCSVPopup={setShouldShowImportCSVPopup} enterCallback={handleImportCSVData} />
            : null
        }
        {
            shouldShowAddRoomPopup ?
            <EditRoomPopup currentTheme={currentTheme} currentUser={currentUser} setShouldShowAddRoomPopup={setShouldShowAddRoomPopup} schoolLocationID={schoolLocations[currentSchoolLocationIndex]._id} syncWithDatabase={syncWithDatabase} targetRoom={targetRoom} />
            : null
        }
        <section id="manage-rooms-view">
            <div id="room-list">
                <div id="header" style={{backgroundColor: currentTheme.offset}}>
                    <select ref={schoolSelectRef} style={{color: currentTheme.text}} onChange={handleUpdateRooms}>
                        {
                            schoolLocations && schoolLocations.map(schoolLocation => {
                                return <option key={schoolLocation._id} value={schoolLocation._id} style={{backgroundColor: currentTheme.backgroundColor, border: "none"}}>{schoolLocation.name}</option>
                            })
                        }
                    </select>
                    <div>
                        <button id="add-btn" style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} onClick={handleAddRoom}>Add</button>
                        <button id="import-btn" style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} onClick={handleImportData}>Import</button>
                    </div>
                </div>
                <ul id="rooms">
                    {
                        schoolLocations && schoolLocations[currentSchoolLocationIndex].roomLocations.map((room) => {
                            return <Room key={room.roomLocation} currentUser={currentUser} currentTheme={currentTheme} room={room} 
                            schoolLocationID={schoolLocations[currentSchoolLocationIndex]} syncWithDatabase={syncWithDatabase} handleEditRoom={handleEditRoom} /> 
                        })
                    }
                    {
                        !schoolLocations ?
                        <>
                            <br />
                            <LoadingSpinner currentTheme={currentTheme} size={50} />
                            <br />
                        </>
                        : null
                    }
                </ul>
                
            </div>

        </section>
        </>
    )

}