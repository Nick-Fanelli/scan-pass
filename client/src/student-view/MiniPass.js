export default function MiniPass({ currentTheme, pass, startPassCallback }) {
    // Calculate Date
    const rawDate = new Date(Number.parseInt(pass.departureTimestamp));
    let dayOfTheWeek = rawDate.toLocaleDateString("en-US", {
        weekday: 'long'
    });

    // TODO: Identify Expired Passes

    // Check to see if the pass is today
    const todaysDate = new Date();
    if(todaysDate.getFullYear() === rawDate.getFullYear() &&
    todaysDate.getMonth() === rawDate.getMonth() &&
    todaysDate.getDate() === rawDate.getDate()) {
        dayOfTheWeek = "Today";
    }

    // Calculate Time
    let hours = rawDate.getHours();
    let minutes = rawDate.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? ("0" + minutes) : minutes;

    const formattedTime = `${hours}:${minutes}${ampm}`;

    return (
        <div className="mini-pass" style={{backgroundColor: "#00a2ff"}} onClick={() => startPassCallback(pass)}>
            <h1 className="arrival-location">{pass.arrivalLocation}</h1>
            {/* <h1>{pass.departureLocation}</h1>
            <p>{formattedDate}</p>
            <h1>{pass.arrivalLocation}</h1> */}
            <div className="pass-bottom">
                <p>{dayOfTheWeek}, {formattedTime}</p>
            </div>
        </div>
    );
    
}