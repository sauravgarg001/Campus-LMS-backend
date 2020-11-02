const mongoose = require('mongoose');

let assignmentSchema = new mongoose.Schema({
    assignmentId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    submitted: {
        type: String
    },
    deadline: {
        type: Date,
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

module.exports = mongoose.model('Assignment', assignmentSchema);