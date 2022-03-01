const router = require('express').Router();
const SchoolLocation = require('../models/SchoolLocation.Model');
const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware'); 

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

router.route('/get-all').get(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const schoolLocationData = await SchoolLocation.find();
    res.send(schoolLocationData);
});

router.route('/add-bathroom').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const schoolLocationID = req.body.schoolLocationID;
    const bathroomLocation = req.body.bathroomLocation;

    if(!schoolLocationID || !bathroomLocation) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    if(schoolLocation.bathroomLocations.includes(bathroomLocation)) {
        res.status(400).send("Naming Collision"); // Bad Request
        return;
    }

    schoolLocation.bathroomLocations.push(bathroomLocation);
    schoolLocation.save();
    res.status(200).send();
});

router.route('/delete-bathroom').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const schoolLocationID = req.body.schoolLocationID;
    const bathroomLocation = req.body.bathroomLocation;

    if(!schoolLocationID || !bathroomLocation) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    const index = schoolLocation.bathroomLocations.indexOf(bathroomLocation);

    if(index <= -1) {
        res.status(400).send("Could not find bathroom location with requested ID!"); // Bad Request
        return;
    }

    schoolLocation.bathroomLocations.splice(index, 1);
    schoolLocation.save();
    res.status(200).send(); // OK
});

router.route('/add-room').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const schoolLocationID = req.body.schoolLocationID;
    const roomLocation = req.body.roomLocation;

    if(!schoolLocationID || !roomLocation) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    if(schoolLocation.roomLocations.includes(roomLocation)) {
        res.status(400).send("Naming Collision"); // Bad Request
        return;
    }

    schoolLocation.roomLocations.push(roomLocation);
    schoolLocation.save();
    res.status(200).send();
});

router.route('/delete-room').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    // Get the params
    const schoolLocationID = req.body.schoolLocationID;
    const roomLocation = req.body.roomLocation;

    if(!schoolLocationID || !roomLocation) {
        res.status(400).send("Missing Body Args"); // Bad request
        return;
    }

    const schoolLocation = await SchoolLocation.findById(schoolLocationID);

    if(!schoolLocation) {
        res.status(400).send("Could not find school location with requested ID!"); // Bad Request
        return;
    }

    const index = schoolLocation.roomLocations.indexOf(roomLocation);

    if(index <= -1) {
        res.status(400).send("Could not find room location with requested ID!"); // Bad Request
        return;
    }

    schoolLocation.roomLocations.splice(index, 1);
    schoolLocation.save();
    res.status(200).send(); // OK
});

module.exports = router;