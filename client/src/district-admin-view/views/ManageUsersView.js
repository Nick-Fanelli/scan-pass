import { useCallback, useEffect, useRef, useState } from 'react';
import './ManageUsersView.css'

import { server } from '../../ServerAPI';

import EditUserPopup from './EditUserPopup';
import UserItem from './UserItem'

import { UserType } from '../../User';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const PageAmount = 100;

export default function ManageUsersView({ currentUser, currentTheme }) {
    
    const maxPageCount = useRef();

    const [usersList, setUsersList] = useState(null);
    const [searchText, setSearchText] = useState("");

    const [isEditUserPopupVisible, setIsEditUserPopupVisible] = useState(false);
    const [currentEditableUser, setCurrentEditableUser] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);

    const syncWithDatabase = useCallback(() => {
        // Load all users from database
        server.get('/users/get-all', {
            headers: { authorization: currentUser.accessToken }
        }).then((result) => {

            // Get Users List
            const usersList = result.data;

            // Sort Users
            usersList.sort((a, b) => a.userName > b.userName ? 1 : -1);

            // Create the separate arrays
            let districtAdminUsers = [];
            let adminUsers = [];
            let teacherUsers = [];
            let studentUsers = [];

            // Assign each user to their respected arrays
            usersList.forEach(user => {
                switch(user.userType) {
                case UserType.DistrictAdmin:
                    districtAdminUsers.push(user);
                    break;
                case UserType.Admin:
                    adminUsers.push(user);
                    break;
                case UserType.Teacher:
                    teacherUsers.push(user);
                    break;
                case UserType.Student:
                default:
                    studentUsers.push(user);
                    break;
                }
            });

            // Sort users by type
            const sortedUsers = [...districtAdminUsers, ...adminUsers, ...teacherUsers, ...studentUsers];

            maxPageCount.current = Math.ceil(sortedUsers.length / PageAmount);

            setUsersList(sortedUsers);
        });
    }, [currentUser.accessToken]);

    useEffect(() => {
        syncWithDatabase(); // Sync with Database
    }, [syncWithDatabase]);

    function handleImportUserData() {
    }
    
    function handleAddUser() {
        setCurrentEditableUser(null);
        setIsEditUserPopupVisible(true);
    }

    function handleEditUser(user) {
        setCurrentEditableUser(user);
        setIsEditUserPopupVisible(true);
    }

    const incrementCurrentPageCount = () => {
        if(currentPage + 1 < maxPageCount.current)
            setCurrentPage(currentPage + 1);
    }

    const decrementCurrentPageCount = () => {
        if(currentPage - 1 >= 0)
            setCurrentPage(currentPage - 1);
    }

    let usersListElements = [];

    // TODO: Run Loading Animation
    if(usersList) {

        let skippedUserCount = 0;
        
        for(let i = (currentPage * PageAmount); i < (currentPage * PageAmount) + PageAmount + skippedUserCount; i++) {
            if(i > usersList.length - 1)
                break;

            const user = usersList[i];

            if(searchText && searchText.length > 0) {
                if(!user.userName.toLowerCase().includes(searchText)) {
                    skippedUserCount++;
                    continue;
                }
            }

            usersListElements.push(<UserItem key={user._id} currentTheme={currentTheme} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} handleEditUser={handleEditUser} />);
        }
    }

    return (
        <>
        {
            isEditUserPopupVisible ?
            <EditUserPopup currentTheme={currentTheme} currentUser={currentUser} setIsEditUserPopupVisible={setIsEditUserPopupVisible} targetUser={currentEditableUser} syncWithDatabase={syncWithDatabase} />
            : null
        }
        <section id="manage-users-view">
            <div id="users-list">
                <div id="header" style={{backgroundColor: currentTheme.offset}}>
                    <h1 style={{color: currentTheme.text}}>Users</h1>
                    <div>
                        <input type="text" name="SearchInput" id="search" placeholder='Search...' style={{color: currentTheme.text}} onChange={(e) => setSearchText(e.target.value.toLowerCase())} />
                        <button id="add-btn"style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} onClick={handleAddUser}>Add</button>
                        <button id="import-btn" style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} onClick={handleImportUserData}>Import</button>
                    </div>
                </div>
                <ul id="users">
                    {usersListElements}
                    <li id="page-controls">
                        <div>
                            <FontAwesomeIcon className="icon" icon={faArrowLeft} onClick={decrementCurrentPageCount} />
                            <p>{currentPage + 1} of {maxPageCount.current}</p>
                            <FontAwesomeIcon className="icon" icon={faArrowRight} onClick={incrementCurrentPageCount} />
                        </div>
                    </li>
                </ul>
            </div>
        </section>
        </>
    );
}