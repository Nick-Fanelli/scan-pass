import { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react'
import LoadingSpinner from '../loading-spinner/LoadingSpinner';
import { server } from '../ServerAPI';
import { UserType } from '../User';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faWalking, faIdBadge, faRestroom } from "@fortawesome/free-solid-svg-icons"

import './DashboardView.css'

export default function DashboardView({ currentTheme, currentUser }) {

    const refreshInterval = useRef();
    const prevPassesData = useRef();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const [schoolLocations, setSchoolLocations] = useState(null);
    const [selectedSchoolLocation, setSelectedSchoolLocation] = useState(null);
    
    const [numStudentsInHallway, setNumStudentsInHallway] = useState(null);
    const [numActivePasses, setNumActivePasses] = useState(null);
    const [numStudentsInBathroom, setNumStudentsInBathroom] = useState(null);

    // Startup Load
    useEffect(() => {

        let shouldCancel = false;

        const call = async () => {
            
            const verifiedUserData = await server.get('/users/get-self', {
                headers: { authorization: currentUser.accessToken }
            });

            if(shouldCancel) return;

            let rawSchoolLocationData = null;

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

        return () => { shouldCancel = true; }

    }, [currentUser.accessToken, setIsLoading, setSchoolLocations, setSelectedSchoolLocation]);

    const loadData = useCallback(() => {

        let shouldCancel = false;

        const call = async () => {
            let passes = await server.get(`/passes/get-all-from-school-location/${selectedSchoolLocation}`, {
                headers: { authorization: currentUser.accessToken }
            });

            if(shouldCancel)
                return;

            const stringifiedPassesData = JSON.stringify(passes.data);

            // Make sure the pass data has changed!
            if(prevPassesData.current === stringifiedPassesData) {
                setIsLoadingData(false);
                return;
            }

            prevPassesData.current = stringifiedPassesData;

            const currentSchoolLocationData = schoolLocations.filter(schoolLocation => schoolLocation._id === selectedSchoolLocation)[0];
            const currentSchoolLocationBathroomsData = currentSchoolLocationData.roomLocations.filter(roomLocation => roomLocation.isBathroom);

            let currentSchoolLocationBathrooms = [];
            currentSchoolLocationBathroomsData.forEach(bathroomData => {
                currentSchoolLocationBathrooms.push(bathroomData.roomLocation);
            });

            // Calculate Number of Students In Hallway
            let studentsInHallway = 0;
            let studentsInBathroom = 0;
            passes.data.forEach(pass => {
                if(!pass.arrivalTimestamp)
                    studentsInHallway++;
                else {
                    if(currentSchoolLocationBathrooms.includes(pass.arrivalLocation))
                        studentsInBathroom++;
                }
            });
    
            const currentTime = new Date();

            setNumActivePasses(prev => ({
                timestamp: (prev && (passes.data.length === prev.data)) ? prev.timestamp : 
                    (currentTime.getHours() > 12 ? currentTime.getHours() - 12 : currentTime.getHours()) + ":" + currentTime.getMinutes() + (currentTime.getHours() > 12 ? "pm" : "am"),
                data: passes.data.length
            }));

            setNumStudentsInHallway(prev => ({
                timestamp: (prev && (studentsInHallway === prev.data)) ? prev.timestamp : 
                (currentTime.getHours() > 12 ? currentTime.getHours() - 12 : currentTime.getHours()) + ":" + currentTime.getMinutes() + (currentTime.getHours() > 12 ? "pm" : "am"),
                data: studentsInHallway
            }));

            setNumStudentsInBathroom(prev => ({
                timestamp: (prev && (studentsInBathroom === prev.data)) ? prev.timestamp : 
                (currentTime.getHours() > 12 ? currentTime.getHours() - 12 : currentTime.getHours()) + ":" + currentTime.getMinutes() + (currentTime.getHours() > 12 ? "pm" : "am"),
                data: studentsInBathroom
            }))

            setIsLoadingData(false);
        }

        clearInterval(refreshInterval.current);
        refreshInterval.current = setInterval(call, 2500);
        call();

        return () => { 
            clearInterval(refreshInterval.current);
            shouldCancel = true; 
        }
    }, [setIsLoadingData, selectedSchoolLocation, currentUser.accessToken, setNumActivePasses, refreshInterval, schoolLocations]);

    useEffect(() => {

        clearInterval(refreshInterval.current);
        
        if(selectedSchoolLocation == null)
            return;

        setIsLoadingData(true);
        return loadData();

    }, [selectedSchoolLocation, setIsLoadingData, loadData, refreshInterval]);

    useLayoutEffect(() => {
        clearInterval(refreshInterval.current);
    }, [refreshInterval]);

    if(isLoading) {
        return (
            <div style={{width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <LoadingSpinner currentTheme={currentTheme} />
            </div>
        ) 
    }

    return (
        <section id="dashboard-view">
            {
                schoolLocations.length > 1 &&
                <div id="selection-bar" style={{backgroundColor: currentTheme.offset}}>
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
            }
            {
                !isLoadingData ? 
                <div id="cards">
                <div className="card">
                    <div className='wrapper'>
                        <FontAwesomeIcon icon={faWalking} className="icon" />
                        <div>
                            <h1>{numStudentsInHallway.data}</h1>
                            <p>Students in Hallway</p>
                        </div>
                    </div>
                    <div className='bottom'>
                        <div className="divider"></div>
                        <p className='updated-text'>Updated: {numStudentsInHallway.timestamp}</p>
                    </div>
                </div>
                <div className="card">
                    <div className='wrapper'>
                        <FontAwesomeIcon icon={faIdBadge} className="icon" />
                        <div>
                            <h1>{numActivePasses.data}</h1>
                            <p>Active Passes</p>
                        </div>
                    </div>
                    <div className='bottom'>
                        <div className="divider"></div>
                        <p className='updated-text'>Updated: {numActivePasses.timestamp}</p>
                    </div>
                </div>
                <div className="card">
                    <div className='wrapper'>
                        <FontAwesomeIcon icon={faRestroom} className="icon" />
                        <div>
                            <h1>{numStudentsInBathroom.data}</h1>
                            <p>Students In Bathroom</p>
                        </div>
                    </div>
                    <div className='bottom'>
                        <div className="divider"></div>
                        <p className='updated-text'>Updated: {numStudentsInBathroom.timestamp}</p>
                    </div>
                </div>
                
            </div>
            :
            <div style={{width: "100%", height: "calc(100vh - 3em)", display: "flex", justifyContent: "center", alignItems: "center"}}>
                <LoadingSpinner currentTheme={currentTheme} />
            </div>
            }
        </section>
    )

}