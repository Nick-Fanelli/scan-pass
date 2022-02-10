import './Lav.css'

import Student from './Student'

export default function Lav({ theme, students, processData }) {
    return (
        <section id="lav-view">
            <table id="active-student-table" className="styled-table">
                <thead>
                    <tr style={{backgroundColor: theme.offset}}>
                        <th style={{color: theme.text}}>Name</th>
                        <th style={{color: theme.text}}>Student ID</th>
                        <th style={{color: theme.text}}>Sign-In Time</th>
                        <th style={{color: theme.text}}></th>
                    </tr>
                </thead>

                <tbody style={{color: theme.text}}>
                    {
                        students.map(student => {
                            return <Student key={student.id} theme={theme} student={student} processData={processData} />
                        })
                    }
                </tbody>
            </table>
        </section>
    )
}