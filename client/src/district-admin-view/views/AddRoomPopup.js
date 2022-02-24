import './AddRoomPopup.css'
import '../../Popup.css'
import { useRef } from 'react';

import { server } from '../../ServerAPI';
import { faHandshakeSlash } from '@fortawesome/free-solid-svg-icons';

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
            server.post('/school-locations/add-bathroom/' + currentUser.googleID, {
                schoolLocationID: schoolLocationID,
                bathroomLocation: roomName
            }).then(() => {
                syncWithDatabase();
                handleClose();
            }).catch((err) => {
                console.log(err);
                handleClose();
            });
        } else {
            server.post('/school-locations/add-room/' + currentUser.googleID, {
                schoolLocationID: schoolLocationID,
                roomLocation: roomName
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
                <h1>Add Room</h1>

                <div className="input">                
                    <label htmlFor="input">Room Name</label>
                    <input type="text" name="room-name" id="room-name" ref={roomNameInputRef} />
                </div>

                <div className="input">
                    <label htmlFor="checkbox">Is Bathroom</label>
                    <input type="checkbox" name="is-bathroom" id="is-bathroom-checkbox" ref={isBathroomRef} />
                </div>
                <button id="add-btn" onClick={handleAddRoom}>Add</button>
            </div>
        </div>
    );
}