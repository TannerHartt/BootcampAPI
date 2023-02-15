const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');


// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if (req.params.bootcampId) { // If bootcampId is specified, find all courses that belong to that bootcamp
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else { // If bootcampId is not specified, find all courses
        query = Course.find().populate({ // Populate bootcamp field with bootcamp name and description
            path: 'bootcamp',
            select: 'name description '
        });
    }

    const courses = await query; // Execute query

    res.status(200).json({ // Send response
        success: true,
        count: courses.length,
        data: courses
    });
});