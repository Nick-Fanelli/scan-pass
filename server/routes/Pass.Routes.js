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

module.exports = router;