import './LavNav.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faCog } from "@fortawesome/free-solid-svg-icons"
import { Theme } from '../Theme'

export default function Nav({ theme, setCurrentTheme, currentSchool, currentLav, currentUserName, studentCount }) {

    return (
        <nav style={{backgroundColor: theme.offset}}>
            <div>
                <h2 style={{color: theme.text}}>{currentSchool}</h2>
            </div>
            <div>
                <FontAwesomeIcon style={{color: theme.text}} icon={faExchangeAlt} id="change-location-button" />
                <h2 id="lav-name" style={{color: theme.text}}>{currentLav}</h2>
                <span id="current-student-count" style={{color: theme.text, backgroundColor: theme.darkOffset}}>{studentCount}</span>
            </div>
            <div>
                <h2 id="user-name" style={{color: theme.text}}>{currentUserName}</h2>
                <FontAwesomeIcon id="settings-button" style={{color: theme.text}} icon={faCog} 
                onClick={() => setCurrentTheme(theme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)} />
            </div>
        </nav>
    )

}