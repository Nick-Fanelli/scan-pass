import { useCallback, useEffect, useState } from 'react';
import './ManageUsersView.css'

import { server } from '../../ServerAPI';

import UserItem from './UserItem'
import { UserType } from '../../User';

export default function ManageUsersView({ currentUser, currentTheme }) {
    
    const [usersList, setUsersList] = useState(null);
    const [searchText, setSearchText] = useState("");

    const syncWithDatabase = useCallback(() => {
        // Load all users from database
        server.get('/users/get-all/' + currentUser.googleID).then((result) => {
            setUsersList(result.data);
        });
    }, [currentUser.googleID]);

    useEffect(() => {
        syncWithDatabase(); // Sync with Database
    }, [syncWithDatabase]);

    function handleImportUserData() {

    }

    let districtAdminUserElements = [];
    let adminUserElements = [];
    let teacherUserElements = [];
    let studentUserElements = [];

    if(usersList) {
        usersList.forEach((user) => {
            if(searchText !== "") {
                const transformedUserName = user.userName.toLowerCase();
                if(!transformedUserName.includes(searchText)) {
                    return;
                }
            }

            const userElement = <UserItem key={user._id} currentTheme={currentTheme} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} />;

            switch(user.userType) {
                case UserType.DistrictAdmin:
                    districtAdminUserElements.push(userElement);
                    break;
                case UserType.Admin:
                    adminUserElements.push(userElement);
                    break;
                case UserType.Teacher:
                    teacherUserElements.push(userElement);
                    break;
                case UserType.Student:
                default:
                    studentUserElements.push(userElement);
                    break;
            }

        });
    }

    return (
        <section id="manage-users-view">
            <div id="users-list">
                <div id="header" style={{backgroundColor: currentTheme.offset}}>
                    <h1 style={{color: currentTheme.text}}>Users</h1>
                    <div>
                        <input type="text" name="SearchInput" id="search" placeholder='Search...' style={{color: currentTheme.text}} onChange={(e) => setSearchText(e.target.value.toLowerCase())} />
                        <button id="add-btn"style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} >Add</button>
                        <button id="import-btn" style={{color: currentTheme.text, backgroundColor: currentTheme.offset}} onClick={handleImportUserData}>Import</button>
                    </div>
                </div>
                <ul id="users">
                    {districtAdminUserElements}
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    {adminUserElements}
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    {teacherUserElements}
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    {studentUserElements}
                </ul>
            </div>
        </section>
    );
}