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

// Prevent user from submitting more than one review per bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true }); // This makes it so that a user can only add one review per bootcamp

// Static method to get avg rating
ReviewSchema.statics.getAverageRating = async function(bootcampId) {
    const obj = await this.aggregate([ // Aggregate is a mongoose method that allows us to do advanced queries
        {
            $match: { bootcamp: bootcampId } // Match bootcampId to the bootcamp field
        },
        {
            $group: { // Group by bootcamp
                _id: '$bootcamp', 
                averageRating: { $avg: '$rating' } // Calculate average tuition and set the averageCost field to the result
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, { // Update the bootcamp with the new averageCost
            averageRating: obj[0].averageRating
        });
    } catch (err) {
        console.error(err); // Log error
    }
}


// Call getAverageRating after save
ReviewSchema.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp);
});

// Call getAverageRating before remove
ReviewSchema.pre('remove', function() {
    this.constructor.getAverageRating(this.bootcamp);
});

module.exports = mongoose.model('Review', ReviewSchema);