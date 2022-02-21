import axios from 'axios';
import React, { useEffect } from 'react'

import GoogleLogin from 'react-google-login'

import { SchoolLocations, User } from './User';

import { server } from './ServerAPI';

const GOOGLE_DATA_SESSION_STORAGE_ID = "monroetwp-pass-system.sessionstorage.googleData";

export default function LoginView({ currentTheme, setCurrentUser }) {

    // Pull local storage google id
    useEffect(() => {
        const sessionSavedGoogleData = sessionStorage.getItem(GOOGLE_DATA_SESSION_STORAGE_ID);

        if(sessionSavedGoogleData) {
            handleOnLoginSuccess(JSON.parse(sessionSavedGoogleData));
        }
    }, []);

    async function handleOnLoginSuccess(data) {
        // Pull Data from Google User
        const googleID = data.googleId;
        const username = data.profileObj.name;
        const email = data.profileObj.email;
        const workspaceUserID = email.split("@")[0];

        // Make sure GoogleID isn't null
        if(!googleID) {
            console.error("Couldn't locate a Google ID???");
            return;
        }

        // Verify from database
        try {
            // Verify User
            const response = await server.post('/users/verify', {
                workspaceUserID: workspaceUserID,
                googleID: googleID
            });

            setCurrentUser(new User(
                response.data._id,
                response.data.userType,
                username,
                SchoolLocations.WHS
            ));

        } catch(err) {
            console.error(err);
            return;
        }

        // Save to session storage
        sessionStorage.setItem(GOOGLE_DATA_SESSION_STORAGE_ID, JSON.stringify(data));
    }

    function handleOnLoginFailure() {
    }

    return (
        <div>
            <GoogleLogin 
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                buttonText="Login"
                onSuccess={handleOnLoginSuccess}
                onFailure={handleOnLoginFailure}
                cookiePolicy={'single_host_origin'}
            />
        </div> 
    );

}