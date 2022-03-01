const router = require('express').Router();
const User = require('../models/User.Model');

const jwt = require('jsonwebtoken');

const { AuthLevel, authorize, googleAuthClient } = require('../middleware/AuthorizationMiddleware');

// Login
router.route('/login').post((req, res) => {
   const { tokenId } = req.body;

   googleAuthClient.verifyIdToken({idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID}).then(response => {
        const { email_verified, name, email } = response.payload;
        
        const workspaceUserID = email.split("@")[0];
        
        if(email_verified) {
            User.findOne({
                "userID": workspaceUserID
            }).exec((err, user) => {
                if(err) {
                    return res.status(400).json({
                        error: "Something went wrong with google login..."
                    });
                } else {
                    if(user) {
                        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET);
                        res.json({accessToken: accessToken, user: user});
                    } else {
                        return res.status(401).json({
                            error: "Your account doesn't exist!"
                        });
                    }
                }
            })
        }
   });
});

router.route('/get-all').get(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const userData = await User.find();
    res.send(userData);
});

router.route('/delete-user').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {

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