import { useCallback, useEffect, useRef, useState } from 'react';
import '../../Popup.css'
import { server } from '../../ServerAPI';
import './EditUserPopup.css'
import { UserType } from '../../User';

import { Multiselect } from 'multiselect-react-dropdown';

export default function EditUserPopup({ currentTheme, currentUser, setIsEditUserPopupVisible, targetUser, syncWithDatabase }) {

    const [schoolLocations, setSchoolLocations] = useState(null);
    const [selectedSchoolLocationRooms, setSelectedSchoolLocationRooms] = useState(null);
    const [defaultSelectedSchoolLocations, setDefaultSelectedSchoolLocations] = useState(null);
    
    const [isLoaded, setIsLoaded] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(targetUser === null ? true : false);

    const userNameRef = useRef();
    const userIDRef = useRef();
    const userTypeRef = useRef();
    const userLocationRef = useRef();
    const selectAssignedRoomsRef = useRef();

    const updateAssignedRooms = useCallback(() => {
        if(targetUser.userType !== UserType.Teacher) // Only update teachers
            return;

        if(schoolLocations == null) // Make sure the data has loaded from the db
            return;

        // Get the target school location
        const targetSchoolLocation = (userLocationRef.current) ? userLocationRef.current.value : targetUser.schoolLocation;
        const result = schoolLocations.find(schoolLocation => schoolLocation._id === targetSchoolLocation);
        const rooms = result ? result.roomLocations : null;

        setSelectedSchoolLocationRooms(rooms);

        if(!userLocationRef || !userLocationRef.current || userLocationRef.current.value === targetUser.schoolLocation) {
            // Set Preset Rooms
            if(targetUser.assignedRooms) {                
                let fullRoomData = [];

                targetUser.assignedRooms.forEach(assignedRoom => {
                    for(let i in rooms) {
                        const room = rooms[i];
                        if(room.roomLocation === assignedRoom) {
                            fullRoomData.push(room);
                            break;
                        }
                    }
                });

                setDefaultSelectedSchoolLocations(fullRoomData);
            }
        } else {
            setDefaultSelectedSchoolLocations(null);
        }
    }, [schoolLocations, targetUser.assignedRooms, targetUser.schoolLocation, targetUser.userType]);

    useEffect(() => {
        let shouldCancel = false;

        server.get('/school-locations/get-all', {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            if(shouldCancel)
                return;

            setSchoolLocations(res.data);
            updateAssignedRooms();
            setIsLoaded(true); // Finished Loading
        });

        return () => { shouldCancel = true; }
    }, [setSchoolLocations, currentUser.accessToken, userNameRef, updateAssignedRooms]);

    useEffect(() => {
        updateAssignedRooms();
    }, [schoolLocations, updateAssignedRooms]);

    function handleClose() {
        userNameRef.current.value = "";
        userIDRef.current.value = "";
        setIsEditUserPopupVisible(false);
    }

    function handleIsDisabled() {
        setIsButtonDisabled((userNameRef.current.value.length === 0) || (userIDRef.current.value.length === 0));
    }

    function handleSubmit() {

        const userName = userNameRef.current.value;
        const userID = userIDRef.current.value;
        const userType = userTypeRef.current.value;
        const userLocation = userLocationRef.current.value;

        if(userName.length === 0 || userID.length === 0) {
            console.error("Could not verify username or userID");
            return;
        }

        const updateAssignedRooms = async () => {
            if(targetUser.userType !== UserType.Teacher) // Ensure we are a teacher
                return;

            const selectedRooms = selectAssignedRoomsRef.current.state.selectedValues;

            await server.post(`/users/set-assigned-rooms/${targetUser._id}`, {
                roomsArray: selectedRooms
            }, {
                headers: { authorization: currentUser.accessToken }
            });
        }

        if(targetUser == null) { // Add User
            server.post('/users/add', {
                userName: userName,
                userID: userID,
                userType: userType,
                userLocation: userLocation
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(() => {
                updateAssignedRooms();
                handleClose();
                syncWithDatabase();
            });
        } else { // Edit User
            server.post('/users/edit/' + targetUser._id, {
                userName: userName,
                userID: userID,
                userType: userType,
                userLocation: userLocation
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(() => {
                updateAssignedRooms();
                handleClose();
                syncWithDatabase();
            });
        }
    }

    if(!isLoaded)
        return null;

    return (
        <div id="edit-user-popup" className="popup">
            <div className="box" style={{backgroundColor: currentTheme.backgroundColor}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>x</span>
                <h1 style={{color: currentTheme.text}}>{targetUser == null ? "Add User" : "Edit User"}</h1>
                
                <div className="inputs">
                    <div className='input'>
                        <label htmlFor="" style={{color: currentTheme.text}}>Name</label>
                        <input style={{color: currentTheme.text}} type="text" name="name" id="name-input" placeholder='eg. John Doe' ref={userNameRef} onChange={handleIsDisabled} defaultValue={targetUser === null ? null : targetUser.userName} />
                    </div>

                    <div className='input'>
                        <label htmlFor="" style={{color: currentTheme.text}}>User ID</label>
                        <input style={{color: currentTheme.text}} type="text" name="name" id="name-input" placeholder="eg. 40000 or jdoe" ref={userIDRef} onChange={handleIsDisabled} defaultValue={targetUser === null ? null : targetUser.userID} />
                    </div>

                    <div className='input'>
                        <label htmlFor="" style={{color: currentTheme.text}}>User Type</label>
                        <select style={{color: currentTheme.text}} name="" id="" ref={userTypeRef} defaultValue={targetUser === null ? "Student" : targetUser.userType} >
                            <option value="Student" style={{backgroundColor: currentTheme.backgroundColor}}>Student</option>
                            <option value="Teacher" style={{backgroundColor: currentTheme.backgroundColor}}>Teacher</option>
                            <option value="Admin" style={{backgroundColor: currentTheme.backgroundColor}}>Admin</option>
                        </select>
                    </div>

                    <div className="input">
                        <label htmlFor="" style={{color: currentTheme.text}}>School Location</label>
                        <select style={{color: currentTheme.text}} name="" id="" ref={userLocationRef} defaultValue={targetUser === null ? "null" : targetUser.schoolLocation} onChange={updateAssignedRooms} >
                            <option value="null" style={{backgroundColor: currentTheme.backgroundColor}}>None</option>
                            {
                                schoolLocations.map((schoolLocation) => {
                                    return <option key={schoolLocation._id} value={schoolLocation._id} style={{backgroundColor: currentTheme.backgroundColor}}>{schoolLocation.name}</option>
                                })
                            }
                        </select>
                    </div>

                    {
                        targetUser.userType === UserType.Teacher && selectedSchoolLocationRooms != null ?
                        <div className="input" id="assigned-rooms-input">
                            <label htmlFor="" style={{color: currentTheme.text}}>Assigned Rooms</label>
                            <Multiselect ref={selectAssignedRoomsRef} options={selectedSchoolLocationRooms} displayValue="roomLocation" selectedValues={defaultSelectedSchoolLocations} />
                        </div>
                        : null
                    }
                </div>
                <button style={{color: currentTheme.text}} disabled={isButtonDisabled} onClick={handleSubmit}>{targetUser == null ? "Add" : "Update"}</button>
            </div>
        </div>
    );
}