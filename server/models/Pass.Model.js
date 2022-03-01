const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passSchema = new Schema({
    issuerID: { // Database ID
        type: Schema.Types.ObjectId,
        required: true
    },
    studentID: { // Database ID
        type: Schema.Types.ObjectId,
        required: true,
    },
    departureLocation: { // Database ID
        type: Schema.Types.ObjectId,
        required: false
    },
    departureTimestamp: { // JS Timestamp
        type: String,
        required: false
    },
    arrivalLocation: { // Database ID
        type: Schema.Types.ObjectId,
        required: false
    },
    arrivalLocation: {
        type: String,
        required: false
    }
});

const Pass = mongoose.model("Pass", passSchema);
module.exports = Pass;