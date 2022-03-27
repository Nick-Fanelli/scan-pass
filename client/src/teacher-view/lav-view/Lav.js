import './Lav.css'

import Student from './Student'

export default function Lav({ theme, currentUser, processData, activePasses }) {
    return (
        <section id="lav-view">
            <table id="active-student-table" className="styled-table">
                <thead>
                    <tr style={{backgroundColor: theme.offset}}>
                        <th style={{color: theme.text}}>Name</th>
                        <th style={{color: theme.text}}>Status</th>
                        <th style={{color: theme.text}}>Departing From</th>
                        <th style={{color: theme.text}}>Sign-In Time</th>
                        <th style={{color: theme.text}}></th>
                    </tr>
                </thead>

                <tbody style={{color: theme.text}}>
                    {
                        activePasses.map(pass => {
                            return <Student key={pass._id} theme={theme} pass={pass} currentUser={currentUser} processData={processData} />
                        })
                    }
                </tbody>
            </table>
        </section>
    )
}