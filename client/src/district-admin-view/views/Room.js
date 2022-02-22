import { useState } from "react";

import { faTrash, faPencilAlt, faRestroom, faDoorClosed } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { server } from "../../ServerAPI";

export default function Room({ currentUser, currentTheme, room, schoolLocationID, syncWithDatabase, isBathroom }) {

    const [isBeingDeleted, setIsBeingDeleted] = useState(false);

    function handleDeleteRoom() {
        if(isBeingDeleted)
            return;

        const confirm = window.confirm(`Are you sure you want to delete ${room}?`);

        if(!confirm)
            return;

        setIsBeingDeleted(true);
        
        if(isBathroom) { // Delete Bathroom
            server.post('/school-locations/delete-bathroom/' + currentUser.googleID, {
                schoolLocationID: schoolLocationID,
                bathroomLocation: room
            }).then(() => {
                syncWithDatabase();
            }).catch(() => {
                setIsBeingDeleted(false);
            });
        } else { // Delete Room
            server.post('/school-locations/delete-room/' + currentUser.googleID, {
                schoolLocationID: schoolLocationID,
                roomLocation: room
            }).then(() => {
                syncWithDatabase();
            }).catch(() => {
                setIsBeingDeleted(false);
            });
        }
    }

    function handleEditRoom() {
        console.log("Edit");
    }
    
    return (
        <li style={{
            backgroundColor: currentTheme.backgroundColor,
            borderTop: "dashed 1px " + currentTheme.text + "20",
            borderBottom: "dashed 1px " + currentTheme.text + "20"
        }}>
            <h3 style={{color: currentTheme.text}}>{room}</h3>
            <FontAwesomeIcon icon={isBathroom ? faRestroom : faDoorClosed} className="indicator-icon" style={{color: currentTheme.text}} />
            <div className="controls">
                <FontAwesomeIcon icon={faPencilAlt} className="icon" style={{color: currentTheme.text}} onClick={handleEditRoom} />
                <FontAwesomeIcon icon={faTrash} className="icon" style={{color: currentTheme.text}} onClick={handleDeleteRoom} />
            </div>
        </li>
    );

}