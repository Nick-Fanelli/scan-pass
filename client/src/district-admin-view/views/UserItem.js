import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencilAlt, faTrash } from "@fortawesome/free-solid-svg-icons";
import { UserType } from "../../User";

export default function UserItem({ currentUser, user, syncWithDatabase }) {

    // Display User Type
    let userTypeDisplayName = user.userType;
    if(user.userType === "DistrictAdmin") {
        userTypeDisplayName = "District Admin";
    }

    function handleEditUser() {

    }

    function handleDeleteUser() {

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