import { useCallback, useEffect, useState } from 'react';
import './ManageUsersView.css'

import { server } from '../../ServerAPI';

import EditUserPopup from './EditUserPopup';
import UserItem from './UserItem'
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';

import { UserType } from '../../User';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ManageUsersView({ currentUser, currentTheme }) {
    
    const [usersList, setUsersList] = useState(null);
    const [searchText, setSearchText] = useState("");

    const [isEditUserPopupVisible, setIsEditUserPopupVisible] = useState(false);
    const [currentEditableUser, setCurrentEditableUser] = useState(null);

    const [currentDisplayedUserType, setCurrentDisplayedUserType] = useState(UserType.Student);

    const syncWithDatabase = useCallback(() => {
        // Load all users from database
        server.get('/users/get-all', {
            headers: { authorization: currentUser.accessToken }
        }).then((result) => {

            // Get Users List
            const usersList = result.data;

            // Sort Users
            usersList.sort((a, b) => a.userName > b.userName ? 1 : -1);

            setUsersList(usersList);
        });
    }, [currentUser.accessToken]);

    useEffect(() => {
        syncWithDatabase(); // Sync with Database
    }, [syncWithDatabase]);
    
    function handleAddUser() {
        setCurrentEditableUser(null);
        setIsEditUserPopupVisible(true);
    }

    function handleEditUser(user) {
        setCurrentEditableUser(user);
        setIsEditUserPopupVisible(true);
    }

    let usersListElements = [];

    // TODO: Run Loading Animation
    if(usersList) {
        usersList.forEach(user => {
            if(user.userType !== currentDisplayedUserType)
                return;

            if(searchText && searchText.length > 0) {
                if(!user.userName.toLowerCase().includes(searchText)) {
                    return;
                }
            }

            usersListElements.push(<UserItem key={user._id} currentTheme={currentTheme} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} handleEditUser={handleEditUser} />);
        });
    } else {
        return (
            <>
                <br />
                <LoadingSpinner currentTheme={currentTheme} size={50} />
            </>
        )
    }

    return (
        <>
        {
            isEditUserPopupVisible ?
            <EditUserPopup currentTheme={currentTheme} currentUser={currentUser} setIsEditUserPopupVisible={setIsEditUserPopupVisible} targetUser={currentEditableUser} syncWithDatabase={syncWithDatabase} />
            : null
        }
        <section id="manage-users-view">
            <div id="control-panel" style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>
                <div className="horizontal">
                    <div className="left">
                        <h1>Accounts</h1>
                        <FontAwesomeIcon icon={faSync} className="icon" onClick={syncWithDatabase} />
                    </div>
                    <div className="right">
                        <input type="text" placeholder='Search...' id="search" onChange={(e) => setSearchText(e.target.value.toLowerCase())}/>
                        <button onClick={handleAddUser} id="add-user-btn">Add</button>
                    </div>
                </div>
                <div className="divider" style={{backgroundColor: `${currentTheme.text}30`}}></div>
                <div className="horizontal">
                    <div className="left">
                        <ul>
                            <li className={currentDisplayedUserType === UserType.Student ? `selected` : ''} onClick={() => setCurrentDisplayedUserType(UserType.Student)}>Students</li>
                            <li className={currentDisplayedUserType === UserType.Teacher ? `selected` : ''} onClick={() => setCurrentDisplayedUserType(UserType.Teacher)}>Teachers</li>
                            <li className={currentDisplayedUserType === UserType.Admin ? `selected` : ''} onClick={() => setCurrentDisplayedUserType(UserType.Admin)}>Admins</li>
                            <li className={currentDisplayedUserType === UserType.DistrictAdmin ? `selected` : ''} onClick={() => setCurrentDisplayedUserType(UserType.DistrictAdmin)}>District Admins</li>
                        </ul>
                    </div>
                    <div className="right">

                    </div>
                </div>
            </div>
            <section id="table">
                <table className="styled-table">
                    <thead>
                        <tr style={{backgroundColor: currentTheme.offset}}>
                            <th style={{color: currentTheme.text}}>Name</th>
                            <th style={{color: currentTheme.text}}>User ID</th>
                            <th style={{color: currentTheme.text}}>Type</th>
                            <th style={{color: currentTheme.text}}></th>
                        </tr>
                    </thead>
                    <tbody style={{color: currentTheme.text}}>
                        {usersListElements}
                    </tbody>
                </table>
            </section>
        </section>
        </>
    );
}