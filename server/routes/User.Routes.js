const router = require('express').Router();
const User = require('../models/User.Model');

// Verify User
router.route('/verify').post((req, res) => {

    const userID = req.body.workspaceUserID;
    const googleID = req.body.googleID;

    User.findOne({
        "userID": userID
    }).then((user) => {

        // Verify user exists
        if(user) {
            const userGoogleID = user.googleID;

            // Verify Google ID
            if(userGoogleID) {
                if(userGoogleID === googleID) { // Valid
                    res.send(user);
                } else {
                    res.status(403).send(); // Forbidden
                }
            } else { // If Google ID has never been verified, verify it...
                user.googleID = googleID;
                user.save();

                res.send(user);
            }

        }
        
    })

});

module.exports = router;