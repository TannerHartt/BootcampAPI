const Review = require('../models/Review');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const advancedResults = require('../middleware/advancedResults');


// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) { // If bootcampId is specified, find all courses that belong to that bootcamp
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({ // Send response
            success: true,
            count: reviews.length,
            data: reviews
        });
    } else { // If bootcampId is not specified, find all courses
        return res.status(200).json(res.advancedResults);
    }
});