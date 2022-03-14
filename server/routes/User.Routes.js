const router = require('express').Router();
const User = require('../models/User.Model');
const Pass = require('../models/Pass.Model');

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
                        const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '8hr' });
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

router.route('/get-self').get(async(req, res) => {
    const authToken = req.headers['authorization'];

    if(authToken == null) return res.sendStatus(401); // Unauthorized

    jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403); // Forbidden

        User.findById(user._id).then((result) => {
            return res.json(result);
        });
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

// Add User
router.route('/add').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const { userName, userID, userType, userLocation } = req.body;

    if(userType === AuthLevel.DistrictAdmin)
        return res.sendStatus(403); // Forbidden

    const newUser = new User({
        userID: userID,
        userName: userName,
        userType: userType,
        schoolLocation: userLocation
    });

    newUser.save();

    res.sendStatus(200);
});

// Lookup User
router.route('/lookup-student/:userID').get(authorize(AuthLevel.Teacher), async (req, res) => {

    const user = req.user;
    const requesterLocation = user.schoolLocation;
    
    const targetUserDbID = req.params.userID;
    const targetUser = await User.findById(targetUserDbID);

    if(targetUser === null)
        return res.sendStatus(400); // Bad Client Request

    if((user.userType !== AuthLevel.Admin || user.userType !== AuthLevel.DistrictAdmin) && targetUser.schoolLocation !== requesterLocation)
        return res.sendStatus(403); // Forbidden
        
    res.send(targetUser);
});

// Lookup Student by Student ID
router.route('/lookup-student-by-student-id/:userID').get(authorize(AuthLevel.Teacher), async (req, res) => {
    // const user = req.user;
    // const requesterLocation = user.schoolLocation;

    const targetStudentID = req.params.userID;
    const targetStudent = await User.find({ userID: targetStudentID });

    if(targetStudent === null)
        return res.sendStatus(400); // Bad Client Request

    if(targetStudent.length > 1)
        return res.status(500).send(`Internal Server Error: Multiple Users Point To The Same User ID of: '${targetStudentID}'`);

    res.send(targetStudent[0]);
});

// Edit User
router.route('/edit/:dbID').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {

    const { dbID } = req.params;
    const { userName, userID, userType, userLocation } = req.body;

    if(userType === AuthLevel.DistrictAdmin)
        return res.sendStatus(403); // Forbidden

    const user = await User.findById(dbID);
    user.userName = userName;
    user.userID = userID;
    user.userType = userType;
    user.schoolLocation = userLocation;

    user.save();

    res.sendStatus(200);
});

// Set Current Pass
router.route('/set-current-pass').post(authorize(AuthLevel.Student), async (req, res) => {
    const user = req.user;

    const { passID } = req.body;

    user.currentPass = passID;
    user.save();

    res.sendStatus(200);
});

router.route('/purge-bathroom-passes').post(authorize(AuthLevel.Student), async (req, res) => {
    
    const user = req.user;

    const passes = await Pass.find({
        studentID: user._id
    });

    passes.forEach(pass => { pass.delete() });

    res.sendStatus(200);
});

module.exports = router;