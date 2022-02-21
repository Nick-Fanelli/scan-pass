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

module.exports = router;