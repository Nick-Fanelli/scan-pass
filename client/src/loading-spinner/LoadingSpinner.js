import './LoadingSpinner.css'

export default function LoadingSpinner({ currentTheme, size }) {

    // Default Size
    if(!size) size = 80;

    const borderWidth = (size / 120) * 16;

    return (
        <div className="loading-spinner-wrapper">
            <div className="loading-spinner" style={{
                border: `${borderWidth}px solid ${currentTheme.offset}`,
                borderTop: `${borderWidth}px solid ${currentTheme.text}`,
                width: `${size}px`,
                height: `${size}px`
            }}></div>
            <h1 style={{color: currentTheme.text}}>Loading...</h1>
        </div>
    );

}