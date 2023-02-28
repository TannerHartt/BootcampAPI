const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'], // Custom error message
        maxLength: 100
    },
    text: {
        type: String,
        required: [true, 'Please add some text'] // Custom error message
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add rating between 1 and 10'] // Custom error message
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId, // This is the id of the bootcamp that this course belongs to
        ref: 'User', // Reference to the Bootcamp model
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId, // This is the id of the bootcamp that this course belongs to
        ref: 'Bootcamp', // Reference to the Bootcamp model
        required: true
    }
});

module.exports = mongoose.model('Review', ReviewSchema);