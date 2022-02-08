import './StudentNav.css'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchangeAlt, faCog } from "@fortawesome/free-solid-svg-icons"
import { Theme } from '../Theme'

export default function StudentNav({ theme, setCurrentTheme, currentUser }) {

    return (

        <nav style={{backgroundColor: theme.offset}}>
            <div>
                <h2 style={{color: theme.text}}>{currentUser.userLocation.displayName}</h2>
            </div>
            <div></div>
            <div>
                <h2 id="user-name" style={{color: theme.text}}>{currentUser.name}</h2>
                <FontAwesomeIcon id="settings-button" style={{color: theme.text}} icon={faCog} 
                onClick={() => setCurrentTheme(theme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)} />
            </div>
        </nav>

    );

}