export default function MiniPass({ currentTheme, pass }) {
    // Calculate Date
    const rawDate = new Date(Number.parseInt(pass.departureTimestamp));
    const monthCode = rawDate.toLocaleString('en-us', { month: 'short' });
    const dayNumber = rawDate.getDate();

    // Calculate Time
    let hours = rawDate.getHours();
    let minutes = rawDate.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? ("0" + minutes) : minutes;

    const formattedDate = `${monthCode} ${dayNumber}, ${hours}:${minutes} ${ampm}`;

    return (
        <div className="mini-pass" style={{backgroundColor: "#0390fc"}}>
            <h1>{pass.departureLocation}</h1>
            <p>{formattedDate}</p>
            <h1>{pass.arrivalLocation}</h1>
        </div>
    );
    
}