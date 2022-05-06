import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import LoadingSpinner from '../loading-spinner/LoadingSpinner';
import { server } from '../ServerAPI';
import { UserType } from '../User';

import './HallMonitorView.css';

export default function HallMonitorView({ currentUser, currentTheme }) {

    const refreshInterval = useRef(null);
    const previousPassData = useRef(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingSchoolData, setIsLoadingSchoolData] = useState(false);
    const [schoolLocations, setSchoolLocations] = useState(null);
    const [selectedSchoolLocation, setSelectedSchoolLocation] = useState(null);
    const [selectedSchoolLocationPasses, setSelectedSchoolLocationPasses] = useState(null);

    // Authorize User
    useEffect(() => {
        let shouldCancel = false;

        const call = async () => {
            const verifiedUserData = await server.get('/users/get-self', {
                headers: { authorization: currentUser.accessToken }
            });

            if(shouldCancel)
                return;

            let rawSchoolLocationData = null;

            // Get School Locations
            if(verifiedUserData.data.userType === UserType.DistrictAdmin) {
                let res = await server.get('/school-locations/get-all', {
                    headers: { authorization: currentUser.accessToken }
                });

                if(shouldCancel)
                    return;

                rawSchoolLocationData = res.data;
            } else {
                let res = await server.get('/school-locations/get', {
                    headers: { authorization: currentUser.accessToken }
                });

                if(shouldCancel)
                    return;

                rawSchoolLocationData = [];
                rawSchoolLocationData.push(res.data);
            }  

            setSchoolLocations(rawSchoolLocationData);
            setSelectedSchoolLocation(rawSchoolLocationData[0]._id);
            
            setIsLoading(false);
        }

        call();

        return () => {
            shouldCancel = true;
        }
    }, [currentUser.accessToken, setIsLoading, setSchoolLocations]);
    
    // When selected school location is changed
    useEffect(() => {
        let shouldCancel = false;

        const call = async () => {
            
            if(selectedSchoolLocation == null)
                return;

            // Get the passes
            const res = await server.get(`/passes/get-all-from-school-location/${selectedSchoolLocation}`, {
                headers: { authorization: currentUser.accessToken }
            });

            if(shouldCancel)
                return;
            
            const stringifiedPassData = JSON.stringify(res.data);

            if(stringifiedPassData === previousPassData.current) {
                setIsLoadingSchoolData(false);
                return;
            }

            setIsLoadingSchoolData(true);
            
            previousPassData.current = stringifiedPassData;

            console.log("Updating From Database...");

            // Add to the passes data
            for(let i in res.data) {
                let pass = res.data[i];
                if(!pass)
                    continue;

                const studentData = await server.get(`/users/lookup-student/${pass.studentID}`, {
                    headers: { authorization: currentUser.accessToken }
                });

                if(shouldCancel)    
                    return;

                if(!studentData.data)
                    continue;

                res.data[i].studentName = studentData.data.userName;
                res.data[i].isInHallway = pass.arrivalTimestamp == null;
            }

            setSelectedSchoolLocationPasses(res.data);
            setIsLoadingSchoolData(false);
        }

        // Set the refresh interval
        clearInterval(refreshInterval.current);
        refreshInterval.current = setInterval(call, 1000);
        call();

        return () => {
            clearInterval(refreshInterval.current);
            shouldCancel = true;
        }

    }, [selectedSchoolLocation, setIsLoadingSchoolData, currentUser.accessToken, setSelectedSchoolLocationPasses]);

    // On Detach
    useLayoutEffect(() => {
        clearInterval(refreshInterval.current);
    }, [refreshInterval])

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
                                    const liStyle = (selectedSchoolLocation === schoolLocation._id) ? {borderBottom: `solid ${currentTheme.text} 5px`} : null; 

                                    return <li 
                                                key={schoolLocation._id}
                                                className={selectedSchoolLocation === schoolLocation._id ? "selected" : null}
                                                onClick={() => { setSelectedSchoolLocation(schoolLocation._id); }}
                                                style={liStyle}
                                                >{schoolLocation.name}</li>;
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
                    !isLoadingSchoolData && selectedSchoolLocationPasses && selectedSchoolLocationPasses.length > 0 ?
                    selectedSchoolLocationPasses.map(pass => {
                        return <div className={`pass ${!pass.isInHallway ? "at-location"  : null}`} key={pass._id}>
                            <h1>{pass.arrivalLocation}</h1>
                            <h2>{pass.isInHallway ? "In Hallway" : "Not In Hallway"}</h2>
                            <div className="pass-bottom">
                                <h2 className="student-name">{pass.studentName}</h2>
                            </div>
                        </div>
                    })
                    : <h1 style={{color: currentTheme.text, textAlign: "center", fontSize: "2rem", fontWeight: "100"}}>No Passes to Display</h1>
                }
            </div>

        </section>
    );
}