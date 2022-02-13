export default function ExchangeLocationPopup({ theme, setIsExchangeLocationPopupOpen, schoolLocation, setLavLocation }) {

    function handleClose() {
        setIsExchangeLocationPopupOpen(false);
    }

    function handleLavChange(e) {
        const lavLocationIndex = e.target.getAttribute("location");
        
        setLavLocation(schoolLocation.lavLocations[lavLocationIndex]);
        setIsExchangeLocationPopupOpen(false);
    }

    return (
        <div id="exchange-location-popup">
            <div className="box" style={{backgroundColor: theme.backgroundColor, border: "1px solid" + theme.offset}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: theme.backgroundColor, color: theme.text}}>x</span>
                <div className="header" style={{backgroundColor: theme.offset}}>
                    <h1 style={{color: theme.text}}>Select Lav Location</h1>
                </div>
                <div className="content">
                    <div className="selections" style={{backgroundColor: theme.offset}}>
                        <ul>
                            {
                                schoolLocation.lavLocations.map(location => {
                                    return <li style={{
                                        color: theme.text, 
                                        backgroundColor: theme.backgroundColor
                                    }} key={location} location={schoolLocation.lavLocations.indexOf(location)} onClick={(e) => handleLavChange(e)}>{location}</li>
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

}