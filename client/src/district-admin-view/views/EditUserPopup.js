import { useEffect, useRef, useState } from 'react';
import '../../Popup.css'
import { server } from '../../ServerAPI';
import './EditUserPopup.css'

export default function EditUserPopup({ currentTheme, currentUser, setIsEditUserPopupVisible, targetUser, syncWithDatabase }) {

    const [schoolLocations, setSchoolLocations] = useState(null);

    const [isLoaded, setIsLoaded] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(targetUser === null ? true : false);

    const userNameRef = useRef();
    const userIDRef = useRef();
    const userTypeRef = useRef();
    const userLocationRef = useRef();

    useEffect(() => {
        server.get('/school-locations/get-all', {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            setSchoolLocations(res.data);
            setIsLoaded(true); // Finished Loading
        });
    }, [setSchoolLocations, currentUser.accessToken, userNameRef]);

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

        if(targetUser == null) { // Add User
            server.post('/users/add', {
                userName: userName,
                userID: userID,
                userType: userType,
                userLocation: userLocation
            }, {
                headers: { authorization: currentUser.accessToken }
            }).then(() => {
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
                        <label htmlFor="">Name</label>
                        <input type="text" name="name" id="name-input" placeholder='eg. John Doe' ref={userNameRef} onChange={handleIsDisabled} defaultValue={targetUser === null ? null : targetUser.userName} />
                    </div>

                    <div className='input'>
                        <label htmlFor="">User ID</label>
                        <input type="text" name="name" id="name-input" placeholder="eg. 40000 or jdoe" ref={userIDRef} onChange={handleIsDisabled} defaultValue={targetUser === null ? null : targetUser.userID} />
                    </div>

                    <div className='input'>
                        <label htmlFor="">User Type</label>
                        <select name="" id="" ref={userTypeRef} defaultValue={targetUser === null ? "Student" : targetUser.userType} >
                            <option value="Student">Student</option>
                            <option value="Teacher">Teacher</option>
                            <option value="Admin">Admin</option>
                            <option value="District Admin">District Admin</option>
                        </select>
                    </div>

                    <div className="input">
                        <label htmlFor="">School Location</label>
                        <select name="" id="" ref={userLocationRef} defaultValue={targetUser === null ? "null" : targetUser.schoolLocation} >
                            <option value="null">None</option>
                            {
                                schoolLocations.map((schoolLocation) => {
                                    return <option key={schoolLocation._id} value={schoolLocation._id} >{schoolLocation.name}</option>
                                })
                            }
                        </select>
                    </div>
                </div>
                <button disabled={isButtonDisabled} onClick={handleSubmit}>{targetUser == null ? "Add" : "Update"}</button>
            </div>
        </div>
    );
}