const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');


// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) { // If bootcampId is specified, find all courses that belong to that bootcamp
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({ // Send response
            success: true,
            count: courses.length,
            data: courses
        });

    } else { // If bootcampId is not specified, find all courses
        res.status(200).json(res.advancedResults);
    }

    const courses = await query; // Execute query

    res.status(200).json({ // Send response
        success: true,
        count: courses.length,
        data: courses
    });
});


// @desc    Get single course
// @route   GET /api/v1/course
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({ // Get course by id an populate bootcamp field with bootcamp name and description
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) { // If id is correctly formatted but doesn't exist 
        return next(
            new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ // Send response
        success: true,
        data: course
    });
});


// @desc    Add single course
// @route   PUT /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId; // Set bootcamp field to bootcampId
    req.body.user = req.user.id; // Set user field to user id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if (!bootcamp) { // If id is correctly formatted but doesn't exist 
        return next(
            new ErrorResponse(`No bootcamp with id of ${req.params.bootcampId}`, 404)
        );
    }

    // Make sure user is course owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') { // If user is not the bootcamp owner and is not an admin
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({ // Send response
        success: true,
        data: course
    });
});


// @desc    Delete a course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if (!course) { // If id is correctly formatted but doesn't exist 
        return next(
            new ErrorResponse(`No course with id of ${req.params.id}`, 404)
        );
    }

     // Make sure user is course owner
     if (course.user.toString() !== req.user.id && req.user.role !== 'admin') { // If user is not the bootcamp owner and is not an admin
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`, 401));
    }

    await course.remove();

    res.status(200).json({ // Send response
        success: true,
        data: {}
    });
});


// @desc    Update a course
// @route   POST /api/v1/courses/:id
// @access  Private
exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id);

    if (!course) { // If id is correctly formatted but doesn't exist 
        return next(
            new ErrorResponse(`No course with id of ${req.params.id}`, 404)
        );
    }

    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') { // If user is not the bootcamp owner and is not an admin
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ // Send response
        success: true,
        data: course
    });
});