const mongoose = require('mongoose');

let programmeSchema = new mongoose.Schema({
    programmeId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    degree: {
        type: String,
        required: true
    },
    school: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    modifiedOn: {
        type: Date,
        default: Date.now
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Programme', programmeSchema);