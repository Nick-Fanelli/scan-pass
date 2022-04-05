const router = require('express').Router();
const Pass = require('../models/Pass.Model');
const User = require('../models/User.Model');
const SchoolLocation = require('../models/SchoolLocation.Model');
const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware');

const { archivePass } = require('../HistoricPass');

/**
 * Create Pass
 * Location: /passes/create-pass
 * Method: POST
 * Authorization: Student
 * 
 * Required Body
 *  - studentID
 *  - departureLocation
 *  - departureTimestamp
 *  - arrivalLocation
 * 
 * @returns the created pass
 */
router.route('/create-pass').post(authorize(AuthLevel.Student), async (req, res) => {

    // The user making the database call
    const currentUser = req.user;

    // Get the required body parameters
    const { studentID, departureLocation, departureTimestamp, arrivalLocation } = req.body;

    // Verify Body Parameters
    if(!studentID || !departureLocation || !departureTimestamp || !arrivalLocation) {
        return res.status(400).send("Missing required body parameter"); // 400 Bad Client Error
    }

    let finalStudentID = studentID;

    // Self Student ID Identifications
    if(studentID === "self") {
        finalStudentID = currentUser._id;
    }

    // Get the target user
    const targetUserDBObject = await User.findById(finalStudentID);
    if(!targetUserDBObject)
        return res.status(500).send("Could not find student with id of " + studentID);
    
    // Get the target users school locations
    const targetUserSchoolLocation = await SchoolLocation.findById(targetUserDBObject.schoolLocation);
    if(!targetUserSchoolLocation)
        return res.status(500).send("Could not find the school location...");

    // Verify the departure location
    const verifiedArrivalLocation = targetUserSchoolLocation.roomLocations.find(room => room.roomLocation === arrivalLocation.roomLocation);
    const verifiedDepartureLocation = targetUserSchoolLocation.roomLocations.find(room => room.roomLocation === departureLocation.roomLocation);

    // Verify the arrival location and departure location actually exist
    if(!verifiedArrivalLocation || !verifiedDepartureLocation) {
        return res.status(400).send("Unverifiable room location (departure or arrival)!");
    }

    // Verify the arrival location is student accessible
    if(!verifiedArrivalLocation.isStudentAccessible) {
        if(currentUser.userType === AuthLevel.Student) { // Student's are not allowed to create unaccessible passes
            return res.status(403).send("Unaccessible Room Location"); // Forbidden
        }
    }

    // Create Pass
    const pass = new Pass({
        schoolLocation: currentUser.schoolLocation,
        issuerID: currentUser._id,
        studentID: finalStudentID,
        departureLocation: verifiedDepartureLocation.roomLocation,
        departureTimestamp: departureTimestamp,
        arrivalLocation: verifiedArrivalLocation.roomLocation,
        arrivalTimestamp: null
    });

    // Save the pass
    pass.save();

    // Send back the pass
    res.status(200).send(pass); // OK
});

/**
 * Get Self Pertaining
 * Location: /passes/get-self-pertaining
 * Method: GET
 * Authorization: Student
 * 
 * @returns all the passes related to the active student
 */
router.route('/get-self-pertaining').get(authorize(AuthLevel.Student), async (req, res) => {

    // The user making the database call
    const currentUser = req.user;

    // Get the Passes
    const passes = await Pass.find({
        studentID: currentUser._id
    });

    res.send(passes); // OK
});

/**
 * Get All To Room
 * Location: /passes/get-all-to-room/:schoolLocation/:roomLocation
 * Method: GET
 * Authorization: Teacher
 * 
 * Required Params
 *  - schoolLocation
 *  - roomLocation
 * 
 * @returns all passes going to a specific room
 */
router.route('/get-all-to-room/:schoolLocation/:roomLocation').get(authorize(AuthLevel.Teacher), async (req, res) => {

    const currentUser = req.user;

    // Get the required params
    const { schoolLocation, roomLocation } = req.params;

    // Verify Params
    if(!schoolLocation || !roomLocation) {
        return res.status(400).send("Missing required params"); // 400 Bad Client Error
    }

    // Check to see if the user has access to this school's location
    if(currentUser.userType !== AuthLevel.DistrictAdmin) {
        if(currentUser.schoolLocation !== schoolLocation) {
            return res.sendStatus(403); // Forbidden
        }
    }

    // Get all the passes from that school locations with the arrivalLocation == roomLocation param
    const passes = await Pass.find({
        schoolLocation: schoolLocation,
        arrivalLocation: roomLocation
    });

    // Send the found passes
    res.status(200).send(passes);
});

/**
 * Get
 * Location: /passes/get:id
 * Method: GET
 * Authorization: Student
 * 
 * Required Params
 *  - id
 * 
 * @returns the pass that was specified by the id parameter
 */
router.route('/get/:id').get(authorize(AuthLevel.Student), async (req, res) => {

    // Get the required params
    const { id } = req.params;

    // Verify Params
    if(!id) {
        return res.status(400).send("Missing required params"); // 400 Bad Client Error
    }

    // Get the pass
    const pass = await Pass.findById(id);

    // Verify the pass
    if(!pass) {
        return res.status(400).send("Could not find the specified pass"); // 400 Bad Client Error
    }

    return res.send(pass);
});

/**
 * Set Arrival Timestamp
 * Location: /passes/set-arrival-timestamp/:passID
 * Method: POST
 * Authorization: Student
 * 
 * Required Params
 *  - passID
 * 
 * Required Body
 *  - arrivalTimestamp
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/set-arrival-timestamp/:passID').post(authorize(AuthLevel.Student), async (req, res) => {
    
    const passID = req.params.passID; 
    const { arrivalTimestamp } = req.body;

    if(!arrivalTimestamp) {
        return res.status(400).send("Missing required params");
    }

    let pass = await Pass.findById(passID);

    // Make sure pass exists
    if(!pass)
        return res.sendStatus(400); // Client Error

    pass.arrivalTimestamp = arrivalTimestamp;

    pass.save();

    res.sendStatus(200);
});

/**
 * End Pass
 * Location: /passes/end-pass/:passID
 * Method: POST
 * Authorization: Student
 * 
 * Required Params
 *  - passID
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/end-pass/:passID').post(authorize(AuthLevel.Student), async (req, res) => {

    const user = req.user;

    const passID = req.params.passID;

    if(!passID)
        return res.sendStatus(400);

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

    // Unassign as current pass if applicable
    if(user.currentPass && user.currentPass.toString() === passID.toString()) {
        user.currentPass = null;
        await user.save();
    }

    // Delete Current Pass
    pass.delete();

    res.sendStatus(200); // OK
});

module.exports = router;