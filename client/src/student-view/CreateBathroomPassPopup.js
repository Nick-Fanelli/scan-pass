import { useEffect, useState } from 'react';
import '../Popup.css'

import { server } from '../ServerAPI'

import './CreateBathroomPassPopup.css'

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
            setBathroomLocations(res.data.bathroomLocations.sort());
            setIsLoading(false);
        });
    }, [currentUser.accessToken, setRoomLocations, setBathroomLocations]);

    function handleClose() {
        setSelectedDepartureLocation(null);
        setIsCreateBathroomPassPopupVisible(false);
    }

    function createPass(bathroom) {

        if(selectedDepartureLocation == null) {
            return;
        }

        // Purge Current Bathroom Passes From This User
        server.post('/users/purge-bathroom-passes', {}, {
            headers: { authorization: currentUser.accessToken }
        }).then(() => {
            // Create Pass
            server.post('/passes/create-bathroom-pass', {
                studentID: "self",
                departureLocation: selectedDepartureLocation,
                departureTimestamp: Date.now(),
                arrivalLocation: bathroom
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(res => {
                // Set Current Pass
                server.post('/users/set-current-pass', {
                    passID: res.data._id
                }, {
                    headers: { authorization: currentUser.accessToken }
                }).then(() => {
                    refreshUpdate();
                });
            });
        });    

        handleClose();
    }

    if(isLoading)
        return null;

    return (
        <div id="create-bathroom-pass-popup" className="popup">
            <div className="box" style={{backgroundColor: currentTheme.backgroundColor}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>x</span>
                <h1>{selectedDepartureLocation === null ? "Where Are You Now?" : "What Bathroom Are You Going To?"}</h1>
                <div className="center-wrapper">
                    <input type="text" placeholder='Search...' id="search" onChange={(e) => setSearchContent(e.target.value.toLowerCase())}/>
                    <div id="bathrooms-list-wrapper">
                        {
                            selectedDepartureLocation === null ?
                            <ul id="room-list">
                                {
                                    roomLocations.map(room => {
                                        if(searchContent.length !== 0) {
                                            if(!room.toLowerCase().includes(searchContent)) {
                                                return null;
                                            }
                                        }

                                        return <li style={{backgroundColor: currentTheme.backgroundColor}} key={room}
                                        onClick={() => { setSelectedDepartureLocation(room); setSearchContent(""); }}>{room}</li>;
                                    })
                                }
                            </ul>
                            :
                            <ul>
                                {
                                    bathroomLocations.map(bathroom => {
                                        if(searchContent.length !== 0) {
                                            if(!bathroom.toLowerCase().includes(searchContent)) {
                                                return null;
                                            }
                                        }

                                        return <li style={{backgroundColor: currentTheme.backgroundColor}} key={bathroom}
                                        onClick={() => { createPass(bathroom); } }>{bathroom}</li> 
                                    })
                                }
                            </ul>
                        }
                    </div>
                </div>
            </div>
        </div>
    );

}