import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle } from "@fortawesome/free-solid-svg-icons"

export default function Student({ theme, student, processData }) {
    return (
        <tr>
            <td>{student.name}</td>
            <td className="id">{student.id}</td>
            <td>{student.loginTimestamp}</td>
            <td className="remove-user-btn" onClick={(e) => { processData(student.id) }}>
                <FontAwesomeIcon style={{color: theme.text}} icon={faTimesCircle} id="change-location-button" />
            </td>
        </tr> 
    )
}