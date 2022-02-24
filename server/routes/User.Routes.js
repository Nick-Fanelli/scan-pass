const router = require('express').Router();
const User = require('../models/User.Model');

const { AuthLevel, authorize } = require('../middleware/AuthorizationMiddleware');

// Verify User
router.route('/verify').post((req, res) => {

    const userID = req.body.workspaceUserID;
    const googleID = req.body.googleID;
    const userName = req.body.userName;

    User.findOne({
        "userID": userID
    }).then((user) => {

        // Verify user exists
        if(user) {
            const userGoogleID = user.googleID;

            // Verify Google ID
            if(userGoogleID) {
                if(userGoogleID === googleID) { // Valid

                    // Save Username Data
                    if(user.userName !== userName) {
                        user.userName = userName;
                        user.save();
                    }

                    res.send(user);
                } else {
                    res.status(401).send("Your googleID does not match with database (contact your admin)"); // Unauthorized
                }
            } else { // If Google ID has never been verified, verify it...
                user.googleID = googleID;
                user.save();

                res.send(user);
            }

        }
        
    });
});

router.route('/get-all/:googleID').get(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const userData = await User.find();
    res.send(userData);
});

router.route('/delete-user/:googleID').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {

    const userID = req.body.userID;

    const targetUser = await User.findById(userID);

    if(targetUser.userType !== AuthLevel.DistrictAdmin) {
       targetUser.delete();
       res.status(200).send();
    } else {
        res.status(403).send(); // Forbidden
    }
});

// router.route('/addme').get(async(req, res) => {
//     const user = new User({
//         userID: "sample",
//         googleID: "",
//         userName: "John Doe",
//         userType: "Student",
//         schoolLocation: "null"
//     })

//     user.save();

//     res.send("Success")
// });

module.exports = router;