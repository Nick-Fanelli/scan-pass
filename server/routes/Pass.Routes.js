const router = require('express').Router();
const Pass = require('../models/Pass.Model');
const User = require('../models/User.Model');
const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware');

const { archivePass } = require('../HistoricPass');

router.route('/create-bathroom-pass').post(authorize(AuthLevel.Student), async (req, res) => {

    const currentUser = req.user;

    const { studentID, departureLocation, departureTimestamp, arrivalLocation } = req.body;

    let finalStudentID = studentID;

    // Self Student ID Identifications
    if(studentID === "self") {
        finalStudentID = currentUser._id;
    }

    const pass = new Pass({
        schoolLocation: currentUser.schoolLocation,
        issuerID: currentUser._id,
        studentID: finalStudentID,
        departureLocation: departureLocation,
        departureTimestamp: departureTimestamp,
        arrivalLocation: arrivalLocation,
        arrivalTimestamp: null
    });

    pass.save();

    res.send(pass);
});

router.route('/get-self-pertaining').get(authorize(AuthLevel.Student), async (req, res) => {

    const currentUser = req.user;

    const passes = await Pass.find({
        studentID: currentUser._id
    });

    res.send(passes);

});

router.route('/get/:id').get(authorize(AuthLevel.Student), async (req, res) => {

    const { id } = req.params;

    const pass = await Pass.findById(id);

    if(!pass) {
        return res.sendStatus(400);
    }

    return res.send(pass);
});

router.route('/set-arrival-timestamp/:passID').post(authorize(AuthLevel.Student), async (req, res) => {
    
    const passID = req.params.passID; 
    const { arrivalTimestamp } = req.body;

    let pass = await Pass.findById(passID);

    // Make sure pass exists
    if(!pass)
        return res.sendStatus(400); // Client Error

    pass.arrivalTimestamp = arrivalTimestamp;

    pass.save();

    res.sendStatus(200);
});

router.route('/end-pass/:passID').post(authorize(AuthLevel.Student), async (req, res) => {

    const user = req.user;

    const passID = req.params.passID;

    let pass = await Pass.findById(passID);
    
    // Make sure pass exists
    if(!pass)
        return res.sendStatus(400); // Client Error

    // Verify User
    if(user.userType === AuthLevel.Student) {
        if(pass.studentID !== user._id) {
            return res.sendStatus(403); // Forbidden
        }
    }

    const targetUser = User.findById(pass.studentID);
    if(!targetUser) return res.sendStatus(500); // Server Error

    const result = await archivePass(user, pass);

    if(result !== 200) {
        return res.sendStatus(result);
    }
    
    // Remove from user's current pass if applicable
    if(user.currentPass === pass._id) {
        user.currentPass = null;
        user.save();
    }

    // Unassign as current pass if applicable
    if(user.currentPass.toString() === passID.toString()) {
        user.currentPass = null;
        await user.save();
    }

    // Delete Current Pass
    pass.delete();

    res.sendStatus(200); // OK
});

module.exports = router;