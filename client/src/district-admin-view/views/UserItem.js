import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { UserType } from "../../User";

import { server } from "../../ServerAPI";

export default function UserItem({ currentTheme, currentUser, user, syncWithDatabase, handleEditUser }) {

    // Display User Type
    let userTypeDisplayName = user.userType;
    if(user.userType === "DistrictAdmin") {
        userTypeDisplayName = "District Admin";
    }

    function handleDeleteUser() {
        const result = window.confirm("Are you sure you want to delete this user?");

        if(!result)
            return;
        
        server.post('/users/delete-user', {
            userID: user._id
        }, {
            headers: { authorization: currentUser.accessToken }
        }).then(() => {
            syncWithDatabase();
        })
    }

    return (
        <li>
            <h1 style={{color: currentTheme.text}}>{user.userName}</h1>
            <h1 className="user-type" style={{color: currentTheme.text}}>{userTypeDisplayName}</h1>
            <div className="icons">
            {
                user.userType !== UserType.DistrictAdmin ?
                <>
                    <FontAwesomeIcon className="icon" icon={faPencilAlt} style={{color: currentTheme.text}} onClick={() => handleEditUser(user)} />
                    <FontAwesomeIcon className="icon" icon={faTrash} style={{color: currentTheme.text}} onClick={handleDeleteUser} />                
                </>
                :null
            }
            </div>
        </li>
    );

}