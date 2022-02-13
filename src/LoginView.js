import { useEffect, useState } from 'react';
import { GoogleLogin, GoogleLogout } from 'react-google-login';
import { SchoolLocations, User, UserType } from './User';

const GOOGLE_DATA_SESSION_STORAGE_ID = "monroetwp-pass-system.sessionstorage.googleData";

export default function LoginView({ setCurrentUser }) {

    const [googleUserData, setGoogleUserData] = useState(null);

    const onLoginSuccess = (res) => {
        setGoogleUserData(res);
    }

    const onLoginFailure = (res) => {
        console.error(res);
    }

    const calculateUserType = (userID) => {
        if(userID.match(/^[0-9]{5}$/)) {
            return UserType.Student;
        } else {
            return UserType.Teacher;
        }
    }
    
    // Handle Google Data Change
    useEffect(() => {
        if(googleUserData == null) {
            setCurrentUser(null);
        } else {
            sessionStorage.setItem(GOOGLE_DATA_SESSION_STORAGE_ID, JSON.stringify(googleUserData));

            const displayName = googleUserData.profileObj.name;
            const email = googleUserData.profileObj.email;
            const userID = googleUserData.profileObj.email.split('@')[0];

            console.log(googleUserData);

            setCurrentUser(new User(
                calculateUserType(userID),
                userID,
                email,
                displayName,
                SchoolLocations.WHS
            ));
        }
        
    }, [googleUserData]);

    // Load User Data
    useEffect(() => {
        setGoogleUserData(JSON.parse(sessionStorage.getItem(GOOGLE_DATA_SESSION_STORAGE_ID)));
    }, []);

    return (
        <div>
            <GoogleLogin 
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                buttonText='Login with Google'
                onSuccess={onLoginSuccess}
                onFailure={onLoginFailure}
                cookiePolicy={"single_host_origin"}
            />

            {/* <GoogleLogout
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                buttonText='Logout'
                onLogoutSuccess={onLogoutSuccess}
            /> */}
        </div>
    )

}