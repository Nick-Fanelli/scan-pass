import { useRef } from 'react';
import '../../Popup.css'
import './ImportCSVPopup.css'

export default function ImportCSVPopup({ currentTheme, currentUser, importFormat, setShouldShowImportCSVPopup, enterCallback }) {

    const textArea = useRef();

    function handleClose() {
        setShouldShowImportCSVPopup(false);
    }

    function handleFileUpload() {
        const csv = textArea.current.value;
        textArea.current.value = "";

        const lines = csv.split('\n');

        lines.forEach((line, index) => {
            lines[index] = line.split(",");
        });

        enterCallback(lines);
        handleClose();
    }

    return (
        <div id="import-csv-popup" className="popup">
            <div className="box" style={{backgroundColor: currentTheme.backgroundColor}}>
                <span className="close-icon" onClick={handleClose} style={{backgroundColor: currentTheme.backgroundColor, color: currentTheme.text}}>x</span>
                <h1 style={{color: currentTheme.text}}>Import CSV</h1>
                <p style={{color: currentTheme.text}}><strong>Import Format:</strong> {importFormat}</p>
                <div className="file-chooser">
                    <textarea name="" id="" cols="30" rows="10" ref={textArea}></textarea>
                </div>
                <button onClick={handleFileUpload}>Upload</button>
            </div>
        </div>
    )

}