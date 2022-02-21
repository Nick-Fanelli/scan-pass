const User = require('../models/User.Model')

const VerifyUserFromDatabaseID = async (databaseID) => {
    const user = await User.findById(databaseID);
    
    return user;
}

module.exports = VerifyUserFromDatabaseID;