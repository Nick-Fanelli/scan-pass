const router = require('express').Router();
const User = require('../models/User.Model');
const Pass = require('../models/Pass.Model');
const SchoolLocation = require('../models/SchoolLocation.Model');

const jwt = require('jsonwebtoken');

const { AuthLevel, authorize, googleAuthClient } = require('../middleware/AuthorizationMiddleware');

/**
 * Login
 * Location: /users/login
 * Method: POST
 * Authorization: None
 * 
 * Required Body
 *  - tokenId
 * 
 * @returns users's access token and user data
 */
router.route('/login').post((req, res) => {
   
    const { tokenId } = req.body;

    if(!tokenId)
        res.sendStatus(400); // Bad Client Error

    googleAuthClient.verifyIdToken({idToken: tokenId, audience: process.env.GOOGLE_CLIENT_ID}).then(response => {
        const { email_verified, email } = response.payload;
        
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

/**
 * Get Self
 * Location: /users/get-self
 * Method: GET
 * Authorization: None
 * 
 * @returns user data
 */
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

/**
 * Get All
 * Location: /users/get-all
 * Method: GET
 * Authorization: DistrictAdmin
 * 
 * @returns all users from the database
 */
router.route('/get-all').get(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const userData = await User.find();
    res.send(userData);
});

/**
 * Delete User
 * Location: /users/delete-user
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Body
 *  - userID
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/delete-user').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {

    const userID = req.body.userID;

    if(!userID)
        return res.sendStatus(400);

    const targetUser = await User.findById(userID);

    if(targetUser.userType !== AuthLevel.DistrictAdmin) {
       targetUser.delete();
       res.status(200).send();
    } else {
        res.status(403).send(); // Forbidden
    }
});

/**
 * Add
 * Location: /users/add
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Body:
 *  - userName
 *  - userID
 *  - userType
 *  - userLocation
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/add').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const { userName, userID, userType, userLocation } = req.body;

    if(!userName || !userID || !userType || !userLocation)
        return res.sendStatus(400); // Bad Client Error

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

/**
 * Lookup Student
 * Location: /users/lookup-student/:userID
 * Method: GET
 * Authorization: Teacher
 * 
 * Required Params
 *  - targetUserDbID
 * 
 * @returns target student
 */
router.route('/lookup-student/:userID').get(authorize(AuthLevel.Teacher), async (req, res) => {

    const user = req.user;
    const requesterLocation = user.schoolLocation;
    
    const targetUserDbID = req.params.userID;

    if(!targetUserDbID)
        return res.sendStatus(400);

    const targetUser = await User.findById(targetUserDbID);

    if(targetUser === null)
        return res.sendStatus(400); // Bad Client Request

    if((user.userType !== AuthLevel.Admin || user.userType !== AuthLevel.DistrictAdmin) && targetUser.schoolLocation !== requesterLocation)
        return res.sendStatus(403); // Forbidden
        
    res.send(targetUser);
});

/** 
 * Lookup Student by Student ID
 * Location: /users/lookup-student-by-student-id/:userID
 * Method: GET
 * Authorization: Teacher
 * 
 * Required Params
 *  - userID
 * 
 * @returns student
 */
router.route('/lookup-student-by-student-id/:userID').get(authorize(AuthLevel.Teacher), async (req, res) => {
    const targetStudentID = req.params.userID;

    if(!targetStudentID)
        return res.sendStatus(400);

    const targetStudent = await User.findOne({ userID: targetStudentID });

    if(targetStudent === null)
        return res.sendStatus(400); // Bad Client Request

    res.send(targetStudent[0]);
});

/**
 * Edit User
 * Location: /users/edit/:dbID
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Params
 *  - dbID
 * 
 * Required Body
 *  - userName
 *  - userID
 *  - userType
 *  - userLocation
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/edit/:dbID').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {

    const { dbID } = req.params;
    const { userName, userID, userType, userLocation } = req.body;

    if(!dbID || !userName || !userID || !userType || !userLocation)
        return res.sendStatus(400); // Bad client error

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

/**
 * Set Current Pass
 * Location: /users/set-current-pas
 * Method: POST
 * Authorization: Student
 * 
 * Required Body
 *  - passID 
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/set-current-pass').post(authorize(AuthLevel.Student), async (req, res) => {
    const user = req.user;

    const { passID } = req.body;

    if(!passID)
        return res.sendStatus(400);

    user.currentPass = passID;
    user.save();

    res.sendStatus(200);
});

/**
 * Set Assigned Rooms
 * Location: /users/set-assigned-rooms
 * Method: POST
 * Authorization: DistrictAdmin
 * 
 * Required Params
 *  - userID
 * 
 * Required Body
 *  - roomsArray
 */
router.route('/set-assigned-rooms/:userID').post(authorize(AuthLevel.DistrictAdmin), async (req, res) => {
    const user = req.user;

    const { userID } = req.params;
    const { roomsArray } = req.body;

    if(!userID || !roomsArray)
        return res.sendStatus(400);

    let targetUser = await User.findById(userID);

    if(!targetUser)
        return res.sendStatus(400);

    const targetSchoolLocation = await SchoolLocation.findById(targetUser.schoolLocation);

    if(!targetSchoolLocation)
        return res.sendStatus(500);

    // Verify Rooms
    let verifiedRooms = [];

    // Verify the room locations -> verifiedRooms
    roomsArray.forEach(room => {
        const roomLocation = room.roomLocation; 

        for(let i in targetSchoolLocation.roomLocations) {
            const lookupRoom = targetSchoolLocation.roomLocations[i];
            if(lookupRoom.roomLocation === roomLocation) {
                verifiedRooms.push(roomLocation);
                break;
            }
        }
    });

    targetUser.assignedRooms = verifiedRooms;
    await targetUser.save();

    res.send(targetUser);
});

/**
 * Set Current Pass
 * Location: users/set-current-pass/:studentID
 * Method: POST
 * Authorization: Teacher
 * 
 * Required Params
 *  - studentID
 * 
 * Required Body
 *   - passID
 * 
 * @returns status code only (success = 200 OK)
 */
router.route('/set-current-pass/:studentID').post(authorize(AuthLevel.Teacher), async (req, res) => {

    const { studentID } = req.params;    
    const { passID } = req.body;

    const student = await User.findById(studentID);
    
    if(!student || !passID) {
        return res.sendStatus(400); // Client Error
    }

    student.currentPass = passID;
    student.save();

    res.sendStatus(200);
});

/**
 * Purge Bathroom Passes
 * Location: /users/purge-bathroom-passes
 * Method: POST
 * Authorization: Student
 * 
 * @returns student code only (success = 200 OK)
 */
router.route('/purge-bathroom-passes').post(authorize(AuthLevel.Student), async (req, res) => {
    
    const user = req.user;

    const passes = await Pass.find({
        studentID: user._id
    });

    passes.forEach(pass => { pass.delete() });

    res.sendStatus(200);
});

module.exports = router;