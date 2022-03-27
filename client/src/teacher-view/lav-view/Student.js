import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faArrowAltCircleDown } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from 'react';
import { server } from '../../ServerAPI';

export default function Student({ currentUser, theme, pass, processData }) {

    const [userData, setUserData] = useState(null);

    // Load User Data
    useEffect(() => {
        server.get('/users/lookup-student/' + pass.studentID, {
            headers: { authorization: currentUser.accessToken }
        }).then(res => {
            setUserData({
                userName: res.data.userName,
                studentID: res.data.userID
            });
        });
    }, [pass.studentID, currentUser.accessToken, setUserData]);

    if(userData == null)
        return null;

    let passStatus = "Arriving";

    if(pass.arrivalTimestamp) {
        passStatus = "At Location";

        const timestamp = new Date(Number.parseInt(pass.arrivalTimestamp));

        let hours = timestamp.getHours();
        let minutes = timestamp.getMinutes();

        const ampm = hours >= 12 ? "pm" : "am";

        hours = hours % 12;
        hours = hours ? hours : 12;

        minutes = minutes < 10 ? ("0" + minutes) : minutes;

        var displayableTimestamp = hours + ":" + minutes + ampm;
    } else {
        displayableTimestamp = "N/A";
    }

    const colorStyle = {
        backgroundColor: (passStatus === "Arriving" ? "#ff000060" : "transparent"),
    };

    return (
        <tr className="student-row">
            <td>{userData.userName}</td>
            <td>{passStatus}</td>
            <td className="id">{pass.departureLocation}</td>
            <td>{displayableTimestamp}</td>
            <td className="remove-user-btn" onClick={() => { processData(userData.studentID, Date.now()) }}>
                <FontAwesomeIcon style={{color: theme.text}} icon={passStatus === "Arriving" ? faArrowAltCircleDown : faTimesCircle} id="change-location-button" />
            </td>
            <div className="background-color" style={colorStyle}></div>
        </tr> 
    );
}