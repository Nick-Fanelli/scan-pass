import { useCallback, useEffect, useRef, useState } from 'react';
import '../../Popup.css'
import { server } from '../../ServerAPI';
import './EditUserPopup.css'
import { UserType } from '../../User';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner'; 

import { Multiselect } from 'multiselect-react-dropdown';

export default function EditUserPopup({ currentTheme, currentUser, setIsEditUserPopupVisible, targetUser, syncWithDatabase, currentDisplayedUserType }) {

    const [isLoading, setIsLoading] = useState(true);

    // Global DB Data States
    const [schoolLocations, setSchoolLocations] = useState(null);

    // Visual States
    const [isFormValid, setIsFormValid] = useState(false);
    const [selectAssignedRoomElement, setSelectAssignedRoomElement] = useState(null);

    // Initial Input Value States
    const [initialUserNameValue, setInitialUserNameValue] = useState("");
    const [initialUserIDValue, setInitialUserIDValue] = useState("");
    const [initialUserTypeValue, setInitialUserTypeValue] = useState(currentDisplayedUserType);
    const [initialUserLocationValue, setInitialUserLocationValue] = useState(null);

    // Input References
    const userNameRef = useRef();
    const userIDRef = useRef();
    const userTypeRef = useRef();
    const userLocationRef = useRef();
    const userAssignedRoomsRef = useRef();

    // On Load
    useEffect(() => {
        let shouldCancel = false;

        setIsLoading(true);

        // Asynchronous On Load Call
        const call = async () => {
            // Load Required Global State
            const schoolLocationsResponse = await server.get('/school-locations/get-all', {
                headers: { authorization: currentUser.accessToken }
            });

            if(shouldCancel) return;

            setSchoolLocations(schoolLocationsResponse.data);
            
            // Load Target User Data
            if(targetUser != null) { // Load the initial values
                setInitialUserNameValue(targetUser.userName);
                setInitialUserIDValue(targetUser.userID);
                setInitialUserTypeValue(targetUser.userType);
                setInitialUserLocationValue(targetUser.schoolLocation);
            }

            setIsLoading(false);
        }

        call();

        return () => { shouldCancel = true; }
    }, [setIsLoading, currentUser.accessToken, targetUser, setInitialUserNameValue, setInitialUserIDValue, setInitialUserTypeValue, setInitialUserLocationValue]);

    const createMultiselectElement = useCallback(() => {
        if(isLoading) { // Ensure we're not loading
            setSelectAssignedRoomElement(null); 
            return;
        } 
        
        // Make sure we're expected to be a teacher
        if(userTypeRef.current.value !== UserType.Teacher && userTypeRef.current.value !== UserType.Admin) { 
            setSelectAssignedRoomElement(null); 
            return;
        }

        // Check the current school location
        if(userLocationRef.current.value === "null") {
            setSelectAssignedRoomElement(null); 
            return;
        }

        // Get the current school location
        const schoolLocationsFilterResult = schoolLocations.filter(schoolLocation => schoolLocation._id === userLocationRef.current.value);

        // Error Handling
        if(schoolLocationsFilterResult.length <= 0) {
            console.error("Didn't find school. Refresh the page...");
            return;
        }

        // Error Handling
        if(schoolLocationsFilterResult.length !== 1) { // Unexpected Error (should never occur db is total broken...)
            console.error("There's an error and probably a db config error, but im gonna still continue...");
        }

        const currentSchoolLocationData = schoolLocationsFilterResult[0];
        const currentSchoolLocationRoomData = currentSchoolLocationData.roomLocations;

        let selectedRooms = [];

        // Determine if the target student is not null
        if(targetUser != null) {
            if(targetUser.schoolLocation === userLocationRef.current.value) {
                const assignedRooms = targetUser.assignedRooms;

                assignedRooms.forEach(room => {
                    selectedRooms.push({roomLocation: room});
                });
            }
        }

        setSelectAssignedRoomElement({currentSchoolLocationRoomData, selectedRooms})
    }, [isLoading, setSelectAssignedRoomElement, schoolLocations, targetUser]);

    const validateForm = useCallback(() => {
        createMultiselectElement();

        // Validate Fields
        setIsFormValid(userNameRef.current.value.length > 0 && userIDRef.current.value.length > 0);
    }, [createMultiselectElement, setIsFormValid]);

    // Listen for validation
    useEffect(() => {
        if(userNameRef.current && userIDRef.current && userTypeRef.current && userLocationRef.current)
            validateForm();
    }, [validateForm]);

    const handleClose = () => {
        // Clear State

        setIsEditUserPopupVisible(false);
    }

    const handleOnSubmit = () => {
        
        const userName = userNameRef.current.value;
        const userID = userIDRef.current.value;
        const userType = userTypeRef.current.value;
        const userLocation = userLocationRef.current.value;

        if(userName.length === 0 || userID.length === 0) {
            console.error("Could not verify username or userID");
            return;
        }

        const updateAssignedRooms = (userID) => {
            if(!selectAssignedRoomElement || selectAssignedRoomElement == null) {
                syncWithDatabase();
                return;
            }

            const selectedElements = userAssignedRoomsRef.current.state.selectedValues;

            server.post(`/users/set-assigned-rooms/${userID}`, {
                roomsArray: selectedElements
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(syncWithDatabase);
        }

        if(targetUser == null) { // Create User
            server.post('/users/add', {
                userName: userName,
                userID: userID,
                userType: userType,
                userLocation: userLocation
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then((res) => {
                // Update the assigned rooms
                updateAssignedRooms(res.data._id)
                handleClose();
            })
        } else { // Update User
            server.post('/users/edit/' + targetUser._id, {
                userName: userName,
                userID: userID,
                userType: userType,
                userLocation: userLocation
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(() => {
                updateAssignedRooms(targetUser._id);
                handleClose();
            });
        }

    }

    return (
        <div id="edit-user-popup" className="popup">
            <div className="box" style={{backgroundColor: currentTheme.backgroundColor}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>x</span>

                {/* Popup Box Components */}
                {
                    !isLoading ?
                    <>
                        <h1 style={{color: currentTheme.text}}>{targetUser == null ? "Create User" : "Edit User"}</h1>
                        <div className="inputs">
                            <div className='input'>
                                <label htmlFor="" style={{color: currentTheme.text}}>Name</label>
                                <input style={{color: currentTheme.text}} type="text" name="name" id="name-input" placeholder='eg. John Doe' ref={userNameRef} defaultValue={initialUserNameValue} onChange={validateForm} />
                            </div>

                            <div className='input'>
                                <label htmlFor="" style={{color: currentTheme.text}}>User ID</label>
                                <input style={{color: currentTheme.text}} type="text" name="name" id="name-input" placeholder="eg. 40000 or jdoe" ref={userIDRef} defaultValue={initialUserIDValue} onChange={validateForm} />
                            </div>

                            <div className='input'>
                                <label htmlFor="" style={{color: currentTheme.text}}>User Type</label>
                                <select style={{color: currentTheme.text}} name="" id="" ref={userTypeRef} defaultValue={initialUserTypeValue} onChange={validateForm} >
                                    <option value="Student" style={{backgroundColor: currentTheme.backgroundColor}}>Student</option>
                                    <option value="Teacher" style={{backgroundColor: currentTheme.backgroundColor}}>Teacher</option>
                                    <option value="Admin" style={{backgroundColor: currentTheme.backgroundColor}}>Admin</option>
                                </select>
                            </div>

                            <div className="input">
                                <label htmlFor="" style={{color: currentTheme.text}}>School Location</label>
                                <select style={{color: currentTheme.text}} name="" id="" ref={userLocationRef} defaultValue={initialUserLocationValue} onChange={validateForm} >
                                    <option value="null" style={{backgroundColor: currentTheme.backgroundColor}}>None</option>
                                    {
                                        schoolLocations.map((schoolLocation) => {
                                            return <option key={schoolLocation._id} value={schoolLocation._id} style={{backgroundColor: currentTheme.backgroundColor}}>{schoolLocation.name}</option>
                                        })
                                    }
                                </select>
                            </div>

                            {
                                selectAssignedRoomElement == null ||
                                <div className="input" id="assigned-rooms-input">
                                    <label htmlFor="" style={{color: currentTheme.text}}>Assigned Rooms</label>
                                    <Multiselect ref={userAssignedRoomsRef} options={selectAssignedRoomElement.currentSchoolLocationRoomData} displayValue="roomLocation" selectedValues={selectAssignedRoomElement.selectedRooms} />
                                </div>
                                
                            }
                        </div>
                        <button style={{color: currentTheme.text}} onClick={handleOnSubmit} disabled={!isFormValid}>{targetUser == null ? "Add" : "Update"}</button>
                    </>
                    :
                    <>
                        <br /> <br />
                        <LoadingSpinner currentTheme={currentTheme} />
                    </> 
                }

            </div>
        </div>
    )

}