const mongoose = require('mongoose');

let quizSchema = new mongoose.Schema({
    quizId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    questions: [{
        questionId: {
            type: String,
            unique: true
        },
        type: {
            type: String,
            enum: ['SC', 'MC', 'FIB'],
            /*Single Correct, Multiple Correct, Fill in the Blanks */
            default: 'SC'
        },
        question: {
            type: String
        },
        maximumMarks: {
            type: Number
        },
        correct: {
            type: String
        },
        marked: {
            type: String
        },
        score: {
            type: Number
        }
    }],
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

module.exports = mongoose.model('Quiz', quizSchema);