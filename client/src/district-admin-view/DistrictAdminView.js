import { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faIdBadge, faDoorClosed, faCog } from '@fortawesome/free-solid-svg-icons';

import { Theme } from '../Theme';

import './DistrictAdminView.css'

import DAManageRoomsView from './views/ManageRoomsView'

const View = {
    Overview: "Overview",
    HallMonitor: "Hall Monitor",
    Rooms: "Rooms"
}

export default function DistrictAdminView({ currentUser, currentTheme, setCurrentTheme }) {

    const [currentView, setCurrentView] = useState(View.Rooms);
    const manageRoomsView = <DAManageRoomsView currentUser={currentUser} currentTheme={currentTheme} />
    
    let contentView = null;
    switch(currentView) {
        case View.Rooms:
            contentView = manageRoomsView;
            break; 
        default:
            break;
    }

    return (
        <section id="district-admin-view">
            <div id="sidebar" style={{backgroundColor: currentTheme.offset}}>
                <ul style={{color: currentTheme.text}}>
                    <div className="controls">
                        <h1>{currentUser.name}</h1>
                        <FontAwesomeIcon id="settings-button" icon={faCog} style={{color: currentTheme.text}} 
                        onClick={() => setCurrentTheme(currentTheme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)}/>
                    </div>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.Overview ? "active" : null} onClick={() => setCurrentView(View.Overview)}>
                        <p>Overview<FontAwesomeIcon className="icon" icon={faChartLine} /></p>
                    </li>
                    <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.HallMonitor ? "active" : null} onClick={() => setCurrentView(View.HallMonitor)}>
                        <p>Hall Monitor<FontAwesomeIcon className="icon" icon={faIdBadge} /></p>
                    </li>
                    <div className="divider" style={{backgroundColor: currentTheme.text}}></div>
                    <li style={{backgroundColor: currentTheme.offset}} className={currentView === View.Rooms ? "active" : null} onClick={() => setCurrentView(View.Rooms)}>
                        <p>Rooms<FontAwesomeIcon className="icon" icon={faDoorClosed} /></p>
                    </li>
                </ul>
            </div>
            <div id="sidebar-offset"></div>
            <div className="content">
                {contentView}
            </div>
        </section>
    );

}