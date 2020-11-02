const mongoose = require('mongoose');

let courseSchema = new mongoose.Schema({
    courseId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    subjectCode: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    session: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    }],
    batch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty',
        required: true
    },
    grades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Grade'
    }],
    modifiedOn: {
        type: Date,
        default: Date.now
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Course', courseSchema);