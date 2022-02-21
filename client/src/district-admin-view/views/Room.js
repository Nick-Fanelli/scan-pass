import { useState } from "react";

import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { server } from "../../ServerAPI";

export default function Room({ currentUser, currentTheme, room, schoolLocationID, syncWithDatabase, isBathroom }) {

    const [canDelete, setCanDelete] = useState(true);

    function handleDeleteRoom() {
        if(!canDelete)
            return;
        
        if(isBathroom) {

            setCanDelete(false);

            server.post('/school-locations/delete-bathroom/' + currentUser.databaseAuth, {
                schoolLocationID: schoolLocationID,
                bathroomLocation: room
            }).then(() => {
                syncWithDatabase();
                setCanDelete(true);
            })

        }
    }

    function handleEditRoom() {
        console.log("Edit");
    }

    return (
        <li style={{backgroundColor: currentTheme.backgroundColor}}>
            <h3 style={{color: currentTheme.text}}>{room}</h3>
            <div className="controls">
                <FontAwesomeIcon icon={faPencilAlt} className="icon" onClick={handleEditRoom} />
                <FontAwesomeIcon icon={faTrash} className="icon" onClick={handleDeleteRoom} />
            </div>
        </li>
    );

}