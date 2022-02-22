const User = require('../models/User.Model');

const AuthLevel = {
    Student: ["DistrictAdmin", "Admin", "Teacher", "Student"],
    Teacher: ["DistrictAdmin", "Admin", "Teacher" ],
    Admin: [ "DistrictAdmin", "Admin" ],
    DistrictAdmin: [ "DistrictAdmin" ]
};

const authorize = (permissionLevel) => {
    return (req, res, next) => {

        const googleID = req.params.googleID;

        User.find().then((users) => {

            const foundUser = users.find(user => user.googleID === googleID);

            if(!foundUser) {
                res.status(401).send(); // Unauthorized
                return;
            }

            if(!permissionLevel.includes(foundUser.userType)) {
                res.status(403).send(); // Forbidden
                return;
            }

            req.body.user = foundUser;
            next();
        });
    }
};


module.exports = { AuthLevel, authorize };