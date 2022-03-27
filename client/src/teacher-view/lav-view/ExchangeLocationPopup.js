export default function ExchangeLocationPopup({ theme, setIsExchangeLocationPopupOpen, lavLocations, setLavLocation }) {
    function handleClose() {
        setIsExchangeLocationPopupOpen(false);
    }

    function handleLavChange(e) {
        const lavLocationIndex = e.target.getAttribute("location");
        
        setLavLocation(lavLocations[lavLocationIndex]);
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
                                lavLocations.map(location => {
                                    return <li style={{
                                        color: theme.text, 
                                        backgroundColor: theme.backgroundColor
                                    }} key={JSON.stringify(location)} location={lavLocations.indexOf(location)} onClick={(e) => handleLavChange(e)}>{location.roomLocation}</li>
                                })
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

}