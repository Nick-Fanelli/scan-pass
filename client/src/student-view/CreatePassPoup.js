import { useEffect, useState } from 'react';
import '../Popup.css'

import { server } from '../ServerAPI'

import './CreatePassPopup.css'

export default function CreateBathroomPass({ currentTheme, currentUser, setIsCreateBathroomPassPopupVisible, refreshUpdate }) {

    const [isLoading, setIsLoading] = useState(true);

    const [roomLocations, setRoomLocations] = useState([]);
    const [bathroomLocations, setBathroomLocations] = useState([]);

    const [selectedDepartureLocation, setSelectedDepartureLocation] = useState(null);

    const [searchContent, setSearchContent] = useState("");

    useEffect(() => {
        server.get('/school-locations/get', {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            setRoomLocations(res.data.roomLocations.sort());
            setIsLoading(false);
        });
    }, [currentUser.accessToken, setRoomLocations, setBathroomLocations]);

    function handleClose() {
        setSelectedDepartureLocation(null);
        setIsCreateBathroomPassPopupVisible(false);
    }

    function handleRoom(room) {
        if(selectedDepartureLocation == null)
            setSelectedDepartureLocation(room);
        else
            createPass(room);
    }

    function createPass(arrivalLocation) {

        if(selectedDepartureLocation == null || !arrivalLocation) {
            console.error("Problem with creating the pass: null");
            return;
        }

        // Create the pass
        server.post('/passes/create-pass', {
            studentID: "self",
            departureLocation: selectedDepartureLocation,
            departureTimestamp: Date.now(),
            arrivalLocation: arrivalLocation
        }, {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            // Assign the current user's pass to the created pass
            server.post('/users/set-current-pass', {
                passID: res.data._id
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(() => { refreshUpdate(); });
        });

        handleClose();
    }

    return (
        <div id="create-bathroom-pass-popup" className="popup">
            <div className="box" style={{backgroundColor: currentTheme.backgroundColor}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>x</span>
                {
                    !isLoading ? 
                    <>
                    <h1 style={{color: currentTheme.text}}>{selectedDepartureLocation === null ? "Where Are You Now?" : "Where are you going?"}</h1>
                    <div className="center-wrapper">
                        <input style={{color: currentTheme.text}} type="text" placeholder='Search...' id="search" onChange={(e) => setSearchContent(e.target.value.toLowerCase())}/>
                        <div id="bathrooms-list-wrapper">
                            <ul id="room-list">
                                {
                                    roomLocations.map(room => {
                                        if(searchContent.length !== 0) {
                                            if(!room.roomLocation.toLowerCase().includes(searchContent)) {
                                                return null;
                                            }
                                        }

                                        return <li style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}} key={JSON.stringify(room)}
                                        onClick={() => { handleRoom(room); setSearchContent(""); }}>{room.roomLocation}</li>;
                                    })
                                }
                            </ul>
                        </div>
                    </div>
                    </>
                    :
                    <h1>Loading...</h1>
                }
            </div>
        </div>
    );

}