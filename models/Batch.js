const mongoose = require('mongoose');

let batchSchema = new mongoose.Schema({
    batchId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    yearOfPassing: {
        type: Number,
        required: true,
    },
    programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Programme',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
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

module.exports = mongoose.model('Batch', batchSchema);