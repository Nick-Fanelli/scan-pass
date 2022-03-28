import './EditRoomPopup.css'
import '../../Popup.css'
import { useEffect, useRef } from 'react';

import { server } from '../../ServerAPI';

export default function EditRoomPopup({ currentTheme, currentUser, setShouldShowAddRoomPopup, schoolLocationID, syncWithDatabase, targetRoom }) {

    const roomNameInputRef = useRef();
    const isBathroomRef = useRef();
    const isStudentAccessibleRef = useRef();

    const clearAllFields = () =>  {
        roomNameInputRef.current.value = "";
        isBathroomRef.current.checked = false;
        isStudentAccessibleRef.current.checked = true;
    }

    useEffect(() => {
        if(targetRoom != null) {
            roomNameInputRef.current.value = targetRoom.roomLocation;
            isBathroomRef.current.checked = targetRoom.isBathroom;
            isStudentAccessibleRef.current.checked = targetRoom.isStudentAccessible;
        } else {
            clearAllFields();
        }
    }, [targetRoom]);

    function handleClose() {
        setShouldShowAddRoomPopup(false);

        if(roomNameInputRef.current == null || isBathroomRef.current == null)
            return;
    }

    function handleSubmit() {
        const roomName = roomNameInputRef.current.value;
        const isBathroom = isBathroomRef.current.checked;
        const isStudentAccessible = isStudentAccessibleRef.current.checked;

        if(!roomName || roomName === '') {
            alert("Invalid Room Name!");
            return;
        }

        if(!schoolLocationID) {
            alert("Internal Error: Invalid School Location ID");
            return;
        }

        // Add Room
        if(targetRoom == null) {
            server.post('/school-locations/add-room', {
                schoolLocationID: schoolLocationID,
                roomLocation: roomName,
                isBathroom: isBathroom,
                isStudentAccessible: isStudentAccessible
            }, {
                headers: {
                    authorization: currentUser.accessToken
                }
            }).then(() => {
                syncWithDatabase();
                handleClose();
            }).catch((err) => {
                console.err(err);
                handleClose();
            });
        } else { // Edit Room
            server.post(`/school-locations/edit-room/${targetRoom.roomLocation}`, {
                schoolLocationID: schoolLocationID,
                newRoomLocation: roomName,
                isBathroom: isBathroom,
                isStudentAccessible: isStudentAccessible
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(res => {
                console.log(res);
                syncWithDatabase();
                handleClose();
            }).catch(err => {
                console.error(err);
                handleClose();
            })
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
                    <input type="checkbox" name="is-bathroom" className="checkbox" ref={isBathroomRef} />
                </div>

                <div className="input">
                    <label htmlFor="">Is Student Accessible</label>
                    <input type="checkbox" name="is-student-accessible" className="checkbox" ref={isStudentAccessibleRef} />
                    </div>

                <button id="add-btn" onClick={handleSubmit} style={{color: currentTheme.text}}>{targetRoom == null ? "Add" : "Update"}</button>
            </div>
        </div>
    );
}