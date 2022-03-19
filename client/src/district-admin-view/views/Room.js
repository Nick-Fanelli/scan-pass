import { useState } from "react";

import { faTrash, faRestroom, faDoorClosed } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { server } from "../../ServerAPI";

export default function Room({ currentUser, currentTheme, room, schoolLocationID, syncWithDatabase }) {

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    const isBathroom = room.isBathroom;

    function handleDeleteRoom() {
        if(isBeingDeleted)
            return;

        const confirm = window.confirm(`Are you sure you want to delete ${room.roomLocation}?`);

        if(!confirm)
            return;

        setIsBeingDeleted(true);

        server.post('/school-locations/delete-room', {
            schoolLocationID: schoolLocationID,
            room: room
        }, {
            headers: { authorization: currentUser.accessToken }
        }).then(() => {
            syncWithDatabase();
            setIsBeingDeleted(false);
        }).catch(() => {
            setIsBeingDeleted(false);
        });
    }
    
    return (
        <li style={{
            backgroundColor: currentTheme.backgroundColor,
            borderTop: "dashed 1px " + currentTheme.text + "20",
            borderBottom: "dashed 1px " + currentTheme.text + "20"
        }}>
            <h3 style={{color: currentTheme.text}}>{room.roomLocation}</h3>
            <FontAwesomeIcon icon={isBathroom ? faRestroom : faDoorClosed} className="indicator-icon" style={{color: currentTheme.text}} />
            <div className="controls">
                <FontAwesomeIcon icon={faTrash} className="icon" style={{color: currentTheme.text}} onClick={handleDeleteRoom} />
            </div>
        </li>
    );

}