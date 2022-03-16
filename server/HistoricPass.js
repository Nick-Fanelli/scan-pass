const { AuthLevel } = require('./middleware/AuthorizationMiddleware');
const HistoricPass = require('./models/HistoricPass.Model');
const User = require('./models/User.Model')

const archivePass = async (userAuth, pass) => {

    const student = await User.findById(pass.studentID);
    const passIssuer = await User.findById(pass.issuerID);

    if(!student || !passIssuer)
        return 500; // Server Error
    
    if(userAuth.userType === AuthLevel.Student) {
        if(userAuth.studentID !== student._id) {
            return 403; // Forbidden
        }
    }

    // Save Data
    const archivedPass = new HistoricPass({
        arrivalLocation: pass.arrivalLocation,
        arrivalTimestamp: pass.arrivalTimestamp,
        departureLocation: pass.departureLocation,
        departureTimestamp: pass.departureTimestamp,
        issuer: `${pass.issuerID}|${passIssuer.userName}`,
        student: `${pass.studentID}|${student.userName}`,
        schoolLocation: pass.schoolLocation
    });

    archivedPass.save();

    return 200;
}

module.exports = { archivePass }