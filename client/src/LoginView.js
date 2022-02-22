import React, { useCallback, useEffect, useState } from 'react'

import GoogleLogin from 'react-google-login'

import { SchoolLocations, User } from './User';

import { server } from './ServerAPI';

import './LoginView.css'

const GOOGLE_DATA_SESSION_STORAGE_ID = "monroetwp-pass-system.sessionstorage.googleData";

export default function LoginView({ currentTheme, setCurrentUser }) {

    const [isLoading, setIsLoading] = useState(true);

    const handleOnLoginSuccess = useCallback(async (data) => {
        // Pull Data from Google User
        const googleID = data.googleId;
        const username = data.profileObj.name;
        const email = data.profileObj.email;
        const workspaceUserID = email.split("@")[0];

        // Make sure GoogleID isn't null
        if(!googleID) {
            console.error("Couldn't locate a Google ID???");
            setIsLoading(false);
            return;
        }

        // Verify from database
        try {
            // Verify User
            const response = await server.post('/users/verify', {
                workspaceUserID: workspaceUserID,
                googleID: googleID
            });

            // FIXME: If google id is session saved and not in db it goes to blank screen

            setCurrentUser(new User(
                googleID,
                response.data.userType,
                username,
                SchoolLocations.WHS
            ));

        } catch(err) {
            console.error(err);
            setIsLoading(false);
            return;
        }

        // Save to session storage
        sessionStorage.setItem(GOOGLE_DATA_SESSION_STORAGE_ID, JSON.stringify(data));
        setIsLoading(false);
    }, [setCurrentUser, setIsLoading]);

    // Pull local storage google id
    useEffect(() => {
        const sessionSavedGoogleData = sessionStorage.getItem(GOOGLE_DATA_SESSION_STORAGE_ID);

        if(sessionSavedGoogleData) {
            handleOnLoginSuccess(JSON.parse(sessionSavedGoogleData));
        } else {
            setIsLoading(false);
        }
    }, [handleOnLoginSuccess]);

    function handleOnLoginFailure() {
    }

    if(isLoading)
        return null;

    return (
        <section id="login-view">
            <section id="hero">
                <div style={{color: currentTheme.text}}>
                    <h1>Make Digital Hall Passes Easier!</h1>
                    <p>Scan pass was designed with ease of use in mind by taking advantage of a barcode system.</p>
                </div>
                <div id="buttons">
                    <GoogleLogin
                        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                        buttonText="Login"
                        onSuccess={handleOnLoginSuccess}
                        onFailure={handleOnLoginFailure}
                        cookiePolicy={'single_host_origin'}
                        render={renderProps => (
                            <button onClick={renderProps.onClick} style={{color: currentTheme.text, backgroundColor: currentTheme.offset}}>Login</button>
                        )}
                    />
                    <button style={{color: currentTheme.text, backgroundColor: currentTheme.offset}}>Help Me</button>
                </div>
            </section>
        </section>
    );

}