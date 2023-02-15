const mongoose = require('mongoose');
const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title'] // Custom error message
    },
    description: {
        type: String,
        required: [true, 'Please add a description'] // Custom error message
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks'] // Custom error message
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost'] // Custom error message
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'], // Custom error message
        enum: ['beginner', 'intermediate', 'advanced'] // Only these values are allowed
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId, // This is the id of the bootcamp that this course belongs to
        ref: 'Bootcamp', // Reference to the Bootcamp model
        required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema);