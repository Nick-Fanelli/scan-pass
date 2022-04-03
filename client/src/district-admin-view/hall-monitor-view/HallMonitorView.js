import { useEffect, useRef, useState } from 'react';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { server } from '../../ServerAPI';
import { UserType } from '../../User';

import './HallMonitorView.css';

export default function HallMonitorView({ currentUser, currentTheme }) {

    const [isLoading, setIsLoading] = useState(true);
    const [verifiedUser, setVerifiedUser] = useState(null);
    const [schoolLocations, setSchoolLocations] = useState(null);

    // Authorize User
    useEffect(() => {
        const call = async () => {
            const verifiedUserData = await server.get('/users/get-self', {
                headers: { authorization: currentUser.accessToken }
            });

            setVerifiedUser(verifiedUserData.data);

            let rawSchoolLocationData = null;

            // Get School Locations
            if(verifiedUserData.data.userType === UserType.DistrictAdmin) {
                let res = await server.get('/school-locations/get-all', {
                    headers: { authorization: currentUser.accessToken }
                });

                rawSchoolLocationData = res.data;
            } else {
                let res = await server.get('/school-locations/get', {
                    headers: { authorization: currentUser.accessToken }
                });

                rawSchoolLocationData = [];
                rawSchoolLocationData.push(res.data);
            }  

            setSchoolLocations(rawSchoolLocationData);
            
            setIsLoading(false);
        }

        call();
    }, [currentUser.accessToken, setVerifiedUser, setIsLoading, setSchoolLocations]);


    if(isLoading) {
        return (
            <div id="spinner-wrapper">
                <LoadingSpinner currentTheme={currentTheme} />;
            </div>
        );
    }

    return <h1>Hello</h1>;
}