const router = require('express').Router();
const SchoolLocation = require('../models/SchoolLocation.Model');
const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware'); 

/**
 * Get
 * Location: /school-locations/get
 * Method: GET
 * Authorization: Student
 * 
 * @returns school location data
 */
router.route('/get').get(authorize(AuthLevel.Student), async (req, res) => {
    const userLocation = req.user.schoolLocation;

    if(!userLocation) {
        res.status(500).send("Unable to identify user location (must be set by administrator)");
        return;
    }

    const schoolLocationData = await SchoolLocation.findById(userLocation);

    if(!schoolLocationData) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
    }

    res.send(schoolLocationData);
});

/**
 * Get All
 * Location /school-locations/get-all
 * Method: GET
 * Authorization: DistrictAdmin
 * 
 * @returns all school location data
 */
router.route('/get-all').get(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const schoolLocationData = await SchoolLocation.find();
    res.send(schoolLocationData);
});

/**
 * Add Room
 * Location: /school-locations/add-room
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Body
 *  - schoolLocationID
 *  - roomLocation
 *  - isBathroom
 *  - isStudentAccessible
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/add-room').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const schoolLocationID = req.body.schoolLocationID;
    const { roomLocation, isBathroom, isStudentAccessible } = req.body;

    if(!schoolLocationID || !roomLocation || isBathroom == undefined || isStudentAccessible == undefined) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    let isNamingCollision = false;

    // Check for naming collision
    schoolLocation.roomLocations.forEach(room => {
        if(room.roomLocation == roomLocation) {
            isNamingCollision = true;
            return res.status(400).send("Naming Collision"); // Bad Request
        }
    });

    if(isNamingCollision)
        return;

    schoolLocation.roomLocations.push({roomLocation, isBathroom, isStudentAccessible});
    schoolLocation.save();
    res.status(200).send();
});

/**
 * Edit Room
 * Location: /school-locations/edit-room/:roomLocation
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Params
 *  - roomLocation
 * 
 * Required Body
 *  - schoolLocationID
 *  - newRoomLocation
 *  - isBathroom
 *  - isStudentAccessible
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/edit-room/:roomLocation').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const { roomLocation } = req.params;
    const { schoolLocationID, newRoomLocation, isBathroom, isStudentAccessible } = req.body;

    if(!schoolLocationID || !roomLocation || !newRoomLocation || isBathroom == undefined || isStudentAccessible == undefined) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    let index = -1;

    // Check for naming collision
    schoolLocation.roomLocations.forEach((room, i) => {
        if(room.roomLocation == roomLocation) {
            index = i;
            return;
        }
    });

    if(index == -1)
        return res.status(400).send("Couldn't Identify It!!!!");

    schoolLocation.roomLocations[index] = { roomLocation: newRoomLocation, isBathroom, isStudentAccessible };
    schoolLocation.save();
    res.status(200).send();
});

/**
 * Delete Room
 * Location: /school-locations/delete-room
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Body
 *  - room
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/delete-room').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const schoolLocationID = req.body.schoolLocationID;
    const room = req.body.room;

    if(!schoolLocationID || !room) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    let index = -1;
    const roomStringified = JSON.stringify(room);

    schoolLocation.roomLocations.forEach((room, i) => {
        if(JSON.stringify(room) === roomStringified) {
            index = i;
            return;
        }
    });

    if(index <= -1) {
        res.status(400).send("Could not find room location with requested ID!"); // Bad Request
        return;
    }

    schoolLocation.roomLocations.splice(index, 1);
    schoolLocation.save();
    res.status(200).send(); // OK
});

module.exports = router;