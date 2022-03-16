const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schoolLocationSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    roomLocations: [Object]
});

const SchoolLocation = mongoose.model("SchoolLocation", schoolLocationSchema);
module.exports = SchoolLocation;