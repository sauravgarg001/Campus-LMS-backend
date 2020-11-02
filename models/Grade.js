const mongoose = require('mongoose');

let gradeSchema = new mongoose.Schema({
    gradeId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    // discussions: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Discussion'
    // }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment'
    }],
    midsem: {
        type: String
    },
    endsem: {
        type: String
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

module.exports = mongoose.model('Grade', gradeSchema);