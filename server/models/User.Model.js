const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const userSchema = new Schema({
    userID: { // User ID eg. 40000 or jdoe
        type: String,
        required: true,
        unique: true
    },
    userName: {
        type: String,
        required: false
    },
    userType: { // Student, Teacher, Admin, or DistrictAdmin
        type: String,
        required: true
    },
    schoolLocation: { // WHS or WMS
        type: String,
        required: true
    },
    currentPass: {
        type: Schema.Types.ObjectId,
        required: false
    },
    assignedRooms: {
        type: [String],
        required: false
    }
}, { timestamps: true }); // Auto assign timestamps

const User = mongoose.model("User", userSchema);
module.exports = User;