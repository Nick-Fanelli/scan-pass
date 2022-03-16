import { useEffect, useState, useRef, useCallback } from 'react';

import { server } from '../../ServerAPI';

import AddRoomPopup from './AddRoomPopup';
import ImportCSVPopup from './ImportCSVPopup';
import Room from './Room'

import './ManageRoomsView.css'

export default function DAManageRoomsView({ currentUser, currentTheme }) {

    const [schoolLocations, setSchoolLocations] = useState(null);
    const [currentSchoolLocationIndex, setCurrentSchoolLocationIndex] = useState(0);

    const [shouldShowAddRoomPopup, setShouldShowAddRoomPopup] = useState(false);
    const [shouldShowImportCSVPopup, setShouldShowImportCSVPopup] = useState(false);

    const schoolSelectRef = useRef(null);

    const syncWithDatabase = useCallback(() => {
        server.get('/school-locations/get-all', {
            headers: { authorization: currentUser.accessToken }
        }).then((result) => {
            if(!result) {
                console.error("Load School Locations: Fail");
                return;
            }

            // Sort Room Data
            let schoolLocationsCopy = result.data;

            schoolLocationsCopy.forEach((school) => {
                school.roomLocations.sort();
            });

            setSchoolLocations([...schoolLocationsCopy]);
        });
    }, [currentUser.accessToken]);

    // Load School Locations
    useEffect(() => {
        syncWithDatabase();
    }, [currentUser.databaseAuth, syncWithDatabase]);

    function handleUpdateRooms() {
        setCurrentSchoolLocationIndex(schoolSelectRef.current.selectedIndex);
    }

    function handleAddRoom() {
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

            if(isBathroom) {
                server.post('/school-locations/add-bathroom', {
                    schoolLocationID: currentSchoolLocation,
                    bathroomLocation: roomName
                }, {
                    headers: { authorization: currentUser.accessToken }
                });
            } else {
                server.post('/school-locations/add-room', {
                    schoolLocationID: currentSchoolLocation,
                    roomLocation: roomName
                }, {
                    headers: { authorization: currentUser.accessToken }
                });
            }

        });

        syncWithDatabase();
    }

    if(shouldShowAddRoomPopup && shouldShowImportCSVPopup) {
        setShouldShowAddRoomPopup(false);
        setShouldShowImportCSVPopup(false);
    }

    // Make sure we have school locations
    if(schoolLocations == null)
        return null;

    return (
        <>
        {
            shouldShowImportCSVPopup ?
            <ImportCSVPopup currentTheme={currentTheme} currentUser={currentUser} importFormat={"Room Location (String), Is Bathroom (boolean)"} setShouldShowImportCSVPopup={setShouldShowImportCSVPopup} enterCallback={handleImportCSVData} />
            : null
        }
        {
            shouldShowAddRoomPopup ?
            <AddRoomPopup currentTheme={currentTheme} currentUser={currentUser} setShouldShowAddRoomPopup={setShouldShowAddRoomPopup} schoolLocationID={schoolLocations[currentSchoolLocationIndex]._id} syncWithDatabase={syncWithDatabase} />
            : null
        }
        <section id="manage-rooms-view">
            <div id="room-list">
                <div id="header" style={{backgroundColor: currentTheme.offset}}>
                    <select ref={schoolSelectRef} style={{color: currentTheme.text}} onChange={handleUpdateRooms}>
                        {
                            schoolLocations.map(schoolLocation => {
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
                    {/* {
                        schoolLocations[currentSchoolLocationIndex].bathroomLocations.map((bathroom) => {
                            return <Room key={bathroom} currentUser={currentUser} currentTheme={currentTheme} room={bathroom} 
                            schoolLocationID={schoolLocations[currentSchoolLocationIndex]} syncWithDatabase={syncWithDatabase} isBathroom={true} /> 
                        })
                    } */}
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    {
                        schoolLocations[currentSchoolLocationIndex].roomLocations.map((room) => {
                            return <Room key={room} currentUser={currentUser} currentTheme={currentTheme} room={room} 
                            schoolLocationID={schoolLocations[currentSchoolLocationIndex]} syncWithDatabase={syncWithDatabase} isBathroom={false} /> 
                        })
                    }
                </ul>
                
            </div>

        </section>
        </>
    )

}