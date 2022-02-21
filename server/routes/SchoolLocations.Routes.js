const router = require('express').Router();
const SchoolLocation = require('../models/SchoolLocation.Model');
const User = require('../models/User.Model');
const VerifyUserFromDatabaseID = require('../utils/VerifyUser');

router.route('/get/:auth').get(async (req, res) => {

    const auth = req.params.auth;

    const userAuth = await VerifyUserFromDatabaseID(auth);
    
    if(userAuth) { // Verified
        const userLocation = userAuth.schoolLocation;

        if(!userLocation) {
            res.status(500).send("Unable to identify user location (must be set by administrator)");
            return;
        }

        const schoolLocationData = await SchoolLocation.findById(userLocation);

        res.send(schoolLocationData);
    } else { // Not Verified
        res.status(401).send("Unauthorized Google Account"); // Unauthorized
    }
});

router.route('/get-all/:auth').get(async (req, res) => {
    
    const auth = req.params.auth;

    const userAuth = await VerifyUserFromDatabaseID(auth);

    if(userAuth) { // Verified

        if(userAuth.userType === "DistrictAdmin") { // DistrictAdmin
            const schoolLocationData = await SchoolLocation.find();

            res.send(schoolLocationData);
        } else { // Forbidden
            res.status(403).send("Unauthorized Google Account"); // Forbidden
        }
        
    } else { // Not Verified
        res.status(401).send("Unauthorized Google Account"); // Unauthorized
    }

});

router.route('/add-bathroom/:auth').post(async (req, res) => {

    const auth = req.params.auth;
    const userAuth = await VerifyUserFromDatabaseID(auth);

    if(!userAuth) {
        res.status(401).send("Unauthorized Google Account"); // Unauthorized
        return;
    }

    if(userAuth.userType !== "DistrictAdmin") {
        res.status(403).send("Unauthorized Google Account"); // Forbidden
        return;
    }

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

router.route('/delete-bathroom/:auth').post(async (req, res) => {

    const auth = req.params.auth;
    const userAuth = await VerifyUserFromDatabaseID(auth);

    if(!userAuth) {
        res.status(401).send("Unauthorized Google Account"); // Unauthorized
        return;
    }

    if(userAuth.userType !== "DistrictAdmin") {
        res.status(403).send("Unauthorized Google Account"); // Forbidden
        return;
    }

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

module.exports = router;