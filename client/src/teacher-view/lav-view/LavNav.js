import './LavNav.css'

import ThemeToggleButton from '../../ThemeToggleButton'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons"

export default function LavNav({ theme, setCurrentTheme, currentUser, studentCount, lavLocation, setIsExchangeLocationPopupOpen }) {

    return (
        <nav id="lav-nav" style={{backgroundColor: theme.offset}}>
            <div>
                <h2 style={{color: theme.text}}>Lav Kiosk</h2>
            </div>
            <div>
                <FontAwesomeIcon style={{color: theme.text}} icon={faExchangeAlt} id="change-location-button" onClick={(e) => setIsExchangeLocationPopupOpen(true)} />
                <h2 id="lav-name" style={{color: theme.text}}>{lavLocation}</h2>
                <span id="current-student-count" style={{color: theme.text, backgroundColor: theme.darkOffset}}>{studentCount}</span>
            </div>
            <div>
                <h2 id="user-name" style={{color: theme.text}}>{currentUser.name}</h2>
                <ThemeToggleButton currentTheme={theme} setCurrentTheme={setCurrentTheme} />
            </div>
        </nav>
    )

}