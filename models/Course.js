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
    scholarshipsAvailable: {
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

// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function(bootcampId) {
    const obj = await this.aggregate([ // Aggregate is a mongoose method that allows us to do advanced queries
        {
            $match: { bootcamp: bootcampId } // Match bootcampId to the bootcamp field
        },
        {
            $group: { // Group by bootcamp
                _id: '$bootcamp', 
                averageCost: { $avg: '$tuition' } // Calculate average tuition and set the averageCost field to the result
            }
        }
    ]);

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, { // Update the bootcamp with the new averageCost
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10 // Round to nearest 10
        });
    } catch (err) {
        console.error(err); // Log error
    }
}

// Call getAverageCost after save
CourseSchema.post('save', function() {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove
CourseSchema.pre('remove', function() {
    this.constructor.getAverageCost(this.bootcamp);
});


module.exports = mongoose.model('Course', CourseSchema);