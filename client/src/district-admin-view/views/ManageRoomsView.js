import { useEffect, useState, useRef } from 'react';

import { server } from '../../ServerAPI';

import Room from './Room'

import './ManageRoomsView.css'

export default function DAManageRoomsView({ currentUser, currentTheme }) {

    const [schoolLocations, setSchoolLocations] = useState(null);
    const [currentSchoolLocationIndex, setCurrentSchoolLocationIndex] = useState(0);

    const schoolSelectRef = useRef(null);

    function syncWithDatabase() {
        server.get('/school-locations/get-all/' + currentUser.databaseAuth).then((result) => {
            if(!result) {
                console.error("Load School Locations: Fail");
                return;
            }

            setSchoolLocations(result.data);
        });
    }

    // Load School Locations
    useEffect(() => {
        server.get('/school-locations/get-all/' + currentUser.databaseAuth).then((result) => {
            if(!result) {
                console.error("Load School Locations: Fail");
                return;
            }

            setSchoolLocations(result.data);
        });
    }, [currentUser.databaseAuth]);

    function handleUpdateRooms() {
        setCurrentSchoolLocationIndex(schoolSelectRef.current.selectedIndex);
    }

    function handleAddRoom() {
        const room = window.prompt("Enter Bathroom Name");

        // TODO: Make sure that 'room' is allowed

        // Update Database
        server.post('/school-locations/add-bathroom/' + currentUser.databaseAuth, {
            schoolLocationID: schoolLocations[currentSchoolLocationIndex]._id,
            bathroomLocation: room
        }).then(() => {
            syncWithDatabase();
        }).catch((err) => {
            console.error(err);
        });
    }

    // Make sure we have school locations
    if(schoolLocations == null)
        return null;

    return (
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
                    <button id="add-btn" style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} onClick={handleAddRoom}>Add</button>
                </div>
                <ul id="rooms">
                    {
                        schoolLocations[currentSchoolLocationIndex].bathroomLocations.map((bathroom) => {
                            return <Room key={bathroom} currentUser={currentUser} currentTheme={currentTheme} room={bathroom} 
                            schoolLocationID={schoolLocations[currentSchoolLocationIndex]} syncWithDatabase={syncWithDatabase} isBathroom={true} /> 
                        })
                    }
                </ul>
                
            </div>

        </section>
    )

}