const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');
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


// @desc    Get single reviews
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description' // Only return the name and description of the bootcamp
    });

    if (!review) { // If no review is found, return error
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404));
    }

    // Review was found, return it
    res.status(200).json({ // Send response
        success: true,
        data: review
    });
});


// @desc    Add a review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
exports.addReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId; // Set bootcampId to the bootcampId in the URL
    req.body.user = req.user.id; // Set user to the user that is logged in

    const bootcamp = await Bootcamp.findById(req.params.bootcampId); // Find the bootcamp that the review is for

    // If no bootcamp is found, return error
    if (!bootcamp) return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404));

    const review = await Review.create(req.body); // Create the review

    // Review was found, return it
    res.status(201).json({ // Send response
        success: true,
        data: review
    });
});


// @desc    Update a review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = asyncHandler(async (req, res, next) => {

    let review = await Review.findById(req.params.id); // Find the review

    // If no review is found, return error
    if (!review) return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));

    // Make sure review belongs to user or user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // Review was found, return it
    res.status(200).json({ // Send response
        success: true,
        data: review
    });
});


// @desc    Delete a review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id); // Find the review

    // If no review is found, return error
    if (!review) return next(new ErrorResponse(`No review with the id of ${req.params.id}`, 404));

    // Make sure review belongs to user or user is an admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update this review`, 401));
    }

    await review.remove(); // Remove the review

    // Review was found, return it
    res.status(200).json({ // Send response
        success: true,
        data: {}
    });
});