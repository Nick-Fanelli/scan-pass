import React, { useCallback, useEffect, useState } from 'react'

import GoogleLogin from 'react-google-login'

import { SchoolLocations, User } from './User';

import { server } from './ServerAPI';

import './LoginView.css'

const USER_ACCESS_TOKEN_SESSION_STORAGE_ID = "monroetwp-pass-system.sessionstorage.accessToken";

export default function LoginView({ currentTheme, setCurrentUser }) {

    function loadUser(accessToken) {
        server.get('/users/get-self', {
            headers: { authorization: accessToken }
        }).then((result) => {
            setCurrentUser(new User(
                accessToken,
                result.data.userType,
                result.data.userName,
                SchoolLocations.WHS
            ));

            
            // Save to session storage
            sessionStorage.setItem(USER_ACCESS_TOKEN_SESSION_STORAGE_ID, JSON.stringify(accessToken));
        }).catch(() => {
            sessionStorage.removeItem(USER_ACCESS_TOKEN_SESSION_STORAGE_ID);
        });
    }

    const handleOnLoginSuccess = useCallback((response) => {
        server.post('/users/login', {
            tokenId: response.tokenId
        }).then((response) => {
            const { accessToken } = response.data;
            loadUser(accessToken);
        });
    }, [setCurrentUser]);

    // Pull local storage google id
    useEffect(() => {
        const sessionSavedGoogleData = sessionStorage.getItem(USER_ACCESS_TOKEN_SESSION_STORAGE_ID);

        if(sessionSavedGoogleData) {
            loadUser(JSON.parse(sessionSavedGoogleData));
        }
    }, [handleOnLoginSuccess]);

    function handleOnLoginFailure() {
    }

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