const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const historicPassSchema = new Schema({
    schoolLocation: {
        type: Schema.Types.ObjectId,
        required: true
    },
    issuer: { // Database ID
        type: String,
        required: true
    },
    student: { // Database ID
        type: String,
        required: true,
    },
    departureLocation: { // Database ID
        type: String,
        required: false
    },
    departureTimestamp: { // JS Timestamp
        type: String,
        required: false
    },
    arrivalLocation: { // Database ID
        type: String,
        required: false
    },
    arrivalTimestamp: {
        type: String,
        required: false
    }
});

const HistoricPass = mongoose.model("HistoricPass", historicPassSchema);
module.exports = HistoricPass;