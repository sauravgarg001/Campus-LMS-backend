const mongoose = require('mongoose');

let SRESchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    password: {
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

module.exports = mongoose.model('SRE', SRESchema);