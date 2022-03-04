import './AddRoomPopup.css'
import '../../Popup.css'
import { useRef } from 'react';

import { server } from '../../ServerAPI';

export default function AddRoomPopup({ currentTheme, currentUser, setShouldShowAddRoomPopup, schoolLocationID, syncWithDatabase }) {

    const roomNameInputRef = useRef();
    const isBathroomRef = useRef();

    function handleClose() {
        setShouldShowAddRoomPopup(false);

        if(roomNameInputRef.current == null || isBathroomRef.current == null)
            return;
    
        roomNameInputRef.current.value = "";
        isBathroomRef.current.checked = false;
    }

    function handleAddRoom() {
        const roomName = roomNameInputRef.current.value;
        const isBathroom = isBathroomRef.current.checked;

        if(!roomName || roomName === '') {
            alert("Invalid Room Name!");
            return;
        }

        if(!schoolLocationID) {
            alert("Internal Error: Invalid School Location ID");
            return;
        }

        if(isBathroom) {
            server.post('/school-locations/add-bathroom', {
                schoolLocationID: schoolLocationID,
                bathroomLocation: roomName
            }, {
                headers: {
                    authorization: currentUser.accessToken
                }
            }).then(() => {
                syncWithDatabase();
                handleClose();
            }).catch((err) => {
                console.log(err);
                handleClose();
            });
        } else {
            server.post('/school-locations/add-room', {
                schoolLocationID: schoolLocationID,
                roomLocation: roomName
            }, {
                headers: {
                    authorization: currentUser.accessToken
                }
            }).then(() => {
                syncWithDatabase();
                handleClose();
            }).catch((err) => {
                console.log(err);
                handleClose();
            });
        }
    }
    
    return (
        <div id="add-room-popup" className="popup">
            <div className="box" style={{backgroundColor: currentTheme.backgroundColor}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>x</span>
                <h1 style={{color: currentTheme.text}}>Add Room</h1>

                <div className="input">                
                    <label htmlFor="input" style={{color: currentTheme.text}}>Room Name</label>
                    <input type="text" name="room-name" id="room-name" style={{color: currentTheme.text}} ref={roomNameInputRef} />
                </div>

                <div className="input">
                    <label htmlFor="checkbox" style={{color: currentTheme.text}}>Is Bathroom</label>
                    <input type="checkbox" name="is-bathroom" id="is-bathroom-checkbox" ref={isBathroomRef} />
                </div>
                <button id="add-btn" onClick={handleAddRoom} style={{color: currentTheme.text}}>Add</button>
            </div>
        </div>
    );
}