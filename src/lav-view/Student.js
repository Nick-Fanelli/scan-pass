import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"

export default function Student({ theme, student, processData }) {

    const timestamp = new Date(student.loginTimestamp);

    let hours = timestamp.getHours();
    let minutes = timestamp.getMinutes();

    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    hours = hours ? hours : 12;

    minutes = minutes < 10 ? ("0" + minutes) : minutes;

    const displayableTimestamp = hours + ":" + minutes + ampm;

    return (
        <tr>
            <td>{student.name}</td>
            <td className="id">{student.id}</td>
            <td>{displayableTimestamp}</td>
            <td className="remove-user-btn" onClick={(e) => { processData(student.id) }}>
                <FontAwesomeIcon style={{color: theme.text}} icon={faTimesCircle} id="change-location-button" />
            </td>
        </tr> 
    )
}