import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

import { Theme } from "./Theme";

export default function ThemeToggleButton({ currentTheme, setCurrentTheme }) {
 
    return <FontAwesomeIcon id="settings-button" icon={currentTheme === Theme.LightTheme ? faMoon : faSun} style={{color: currentTheme.text}} 
    onClick={() => setCurrentTheme(currentTheme === Theme.LightTheme ? Theme.DarkTheme : Theme.LightTheme)}/>;

}