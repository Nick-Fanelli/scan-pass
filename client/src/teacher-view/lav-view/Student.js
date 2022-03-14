import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"
import { useEffect, useState } from 'react';
import { server } from '../../ServerAPI';

export default function Student({ currentUser, theme, pass, processData }) {

    const [userData, setUserData] = useState(null);

    // Load User Data
    useEffect(() => {
        server.get('/users/lookup-user/' + pass.studentID, {
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

    if(pass.arrivalTimestamp !== null) {
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

    return (
        <tr>
            <td>{userData.userName}</td>
            <td>{passStatus}</td>
            <td className="id">{userData.studentID}</td>
            <td>{displayableTimestamp}</td>
            <td className="remove-user-btn" onClick={(e) => { processData(pass._id) }}>
                <FontAwesomeIcon style={{color: theme.text}} icon={faTimesCircle} id="change-location-button" />
            </td>
        </tr> 
    )
}