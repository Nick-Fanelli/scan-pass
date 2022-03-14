const router = require('express').Router();
const Pass = require('../models/Pass.Model');
const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware');

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

    const pass = await Pass.findById(passID);
    pass.arrivalTimestamp = arrivalTimestamp;

    pass.save();

    res.sendStatus(200);
})

module.exports = router;