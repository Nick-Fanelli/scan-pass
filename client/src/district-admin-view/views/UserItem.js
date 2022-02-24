import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { UserType } from "../../User";

import { server } from "../../ServerAPI";

export default function UserItem({ currentUser, user, syncWithDatabase }) {

    // Display User Type
    let userTypeDisplayName = user.userType;
    if(user.userType === "DistrictAdmin") {
        userTypeDisplayName = "District Admin";
    }

    function handleEditUser() {

    }

    function handleDeleteUser() {
        server.post('/users/delete-user/' + currentUser.googleID, {
            userID: user._id
        }).then(() => {
            syncWithDatabase();
        })
    }

    return (
        <li>
            <h1>{user.userName}</h1>
            <h1 className="user-type">{userTypeDisplayName}</h1>
            <div className="icons">
            {
                user.userType !== UserType.DistrictAdmin ?
                <>
                    <FontAwesomeIcon className="icon" icon={faPencilAlt} onClick={handleEditUser} />
                    <FontAwesomeIcon className="icon" icon={faTrash} onClick={handleDeleteUser} />                
                </>
                :null
            }
            </div>
        </li>
    );

}