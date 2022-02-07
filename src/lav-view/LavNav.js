import './LavNav.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faCog } from "@fortawesome/free-solid-svg-icons"
import { Theme } from '../Theme'

export default function LavNav({ theme, setCurrentTheme, currentUser, studentCount, lavLocation, setIsExchangeLocationPopupOpen }) {

    return (
        <nav style={{backgroundColor: theme.offset}}>
            <div>
                <h2 style={{color: theme.text}}>{currentUser.userLocation.displayName}</h2>
            </div>
            <div>
                <FontAwesomeIcon style={{color: theme.text}} icon={faExchangeAlt} id="change-location-button" onClick={(e) => setIsExchangeLocationPopupOpen(true)} />
                <h2 id="lav-name" style={{color: theme.text}}>{lavLocation}</h2>
                <span id="current-student-count" style={{color: theme.text, backgroundColor: theme.darkOffset}}>{studentCount}</span>
            </div>
            <div>
                <h2 id="user-name" style={{color: theme.text}}>{currentUser.name}</h2>
                <FontAwesomeIcon id="settings-button" style={{color: theme.text}} icon={faCog} 
                onClick={() => setCurrentTheme(theme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)} />
            </div>
        </nav>
    )

}