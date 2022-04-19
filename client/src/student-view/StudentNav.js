import './StudentNav.css'

import ThemeToggleButton from '../ThemeToggleButton';

export default function StudentNav({ theme, setCurrentTheme, currentUser }) {

    return (

        <nav id="student-nav" style={{backgroundColor: theme.offset}}>
            <div>
                <h2 style={{color: theme.text}}>Student Portal</h2>
            </div>
            <div></div>
            <div>
                <h2 id="user-name" style={{color: theme.text}}>{currentUser.name}</h2>
                <ThemeToggleButton currentTheme={theme} setCurrentTheme={setCurrentTheme} />
            </div>
        </nav>

    );

}