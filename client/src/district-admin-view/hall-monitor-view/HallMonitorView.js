import { useEffect, useRef, useState } from 'react';
import LoadingSpinner from '../../loading-spinner/LoadingSpinner';
import { server } from '../../ServerAPI';
import { UserType } from '../../User';

import './HallMonitorView.css';

export default function HallMonitorView({ currentUser, currentTheme }) {

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSchoolData, setIsLoadingSchoolData] = useState(false);
    const [verifiedUser, setVerifiedUser] = useState(null);
    const [schoolLocations, setSchoolLocations] = useState(null);
    const [selectedSchoolLocation, setSelectedSchoolLocation] = useState(null);
    const [selectedSchoolLocationPasses, setSelectedSchoolLocationPasses] = useState(null);

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
            setSelectedSchoolLocation(rawSchoolLocationData[0]._id);
            
            setIsLoading(false);
        }

        call();
    }, [currentUser.accessToken, setVerifiedUser, setIsLoading, setSchoolLocations]);
    
    // When selected school location is changed
    useEffect(() => {

        const call = async () => {
            if(selectedSchoolLocation == null)
                return;

            setIsLoadingSchoolData(true);

            // Get the passes
            const res = await server.get(`/passes/get-all-from-school-location/${selectedSchoolLocation}`, {
                headers: { authorization: currentUser.accessToken }
            });
            
            // Compare the pass data

            // Add to the passes data
            for(let i in res.data) {
                let pass = res.data[i];
                if(!pass)
                    continue;

                const studentData = await server.get(`/users/lookup-student/${pass.studentID}`, {
                    headers: { authorization: currentUser.accessToken }
                });

                if(!studentData.data)
                    continue;

                res.data[i].studentName = studentData.data.userName;
                res.data[i].isInHallway = pass.arrivalTimestamp == null;
            }

            setSelectedSchoolLocationPasses(res.data);
            setIsLoadingSchoolData(false);
        } 

        call();

    }, [selectedSchoolLocation, setIsLoadingSchoolData, currentUser.accessToken, setSelectedSchoolLocationPasses]);

    if(isLoading) {
        return (
            <div id="spinner-wrapper">
                <LoadingSpinner currentTheme={currentTheme} />;
            </div>
        );
    }

    return (
        <section id="hall-monitor-view">
            <div className="control-panel" style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>
                <div className="horizontal">
                    <div className="left">
                        <h1>Hall Monitor</h1>
                    </div>
                    <div className="right">

                    </div>
                </div>
                <div className="divider" style={{backgroundColor: `${currentTheme.text}30`}}></div>
                <div className="horizontal">
                    <div className="left">
                        <ul>
                            {
                                schoolLocations.map(schoolLocation => {
                                    return <li 
                                                key={schoolLocation._id}
                                                className={selectedSchoolLocation === schoolLocation._id ? "selected" : null}
                                                onClick={() => { setSelectedSchoolLocation(schoolLocation._id); }}>{schoolLocation.name}</li>;
                                })
                            }
                        </ul>
                    </div>
                    <div className="right">

                    </div>
                </div>
            </div>

            <div className="content-container">
                {
                    !isLoadingSchoolData ?
                    selectedSchoolLocationPasses.map(pass => {
                        return <div className={`pass ${!pass.isInHallway ? "at-location"  : null}`} key={pass._id}>
                            <h1>{pass.arrivalLocation}</h1>
                            <h2>{pass.isInHallway ? "In Hallway" : "Not In Hallway"}</h2>
                            <div className="pass-bottom">
                                <h2 className="student-name">{pass.studentName}</h2>
                            </div>
                        </div>
                    })
                    : null
                }
            </div>

        </section>
    );
}