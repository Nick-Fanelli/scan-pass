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

            switch(user.userType) {
                case UserType.DistrictAdmin:
                    districtAdminUserElements.push(<UserItem key={user._id} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} />);
                    break;
                case UserType.Admin:
                    adminUserElements.push(<UserItem key={user._id} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} />);
                    break;
                case UserType.Teacher:
                    teacherUserElements.push(<UserItem key={user._id} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} />);
                    break;
                case UserType.Student:
                default:
                    studentUserElements.push(<UserItem key={user._id} currentUser={currentUser} user={user} syncWithDatabase={syncWithDatabase} />);
                    break;
            }

        });
    }

    return (
        <section id="manage-users-view">
            <div id="users-list">
                <div id="header" style={{backgroundColor: currentTheme.offset}}>
                    <h1>Users</h1>
                    <div>
                        <input type="text" name="SearchInput" id="search" placeholder='Search...' onChange={(e) => setSearchText(e.target.value.toLowerCase())} />
                        <button id="add-btn">Add</button>
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