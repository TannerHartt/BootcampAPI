const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = async (req, res, next) => {

    try {
        const bootcamps = await Bootcamp.find();

        res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
    } catch (error) {
        next(error);
    }
}

// @desc    Get a bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcampById = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findById(req.params.id);

        if (!bootcamp) { // If id is correctly formatted but doesn't exist
            return next(error);
        }

        res.status(200).json({ success: true, data: bootcamp });
    } catch (error) {
        next(error);
    }
}

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = async (req, res, next) => {

    try {
        const bootcamp = await Bootcamp.create(req.body);

        res.status(201).json({
            success: true,
            data: bootcamp
        });
    } catch (error) {
        next(error);
    }
    
}

// @desc    Update a new bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!bootcamp) { // If id is correctly formatted but doesn't exist
            return next(error);
        }
    } catch (error) {
        next(error);
    }
    

    res.status(200).json({ success: true, data: bootcamp });
}

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

        if (!bootcamp) { // If id is correctly formatted but doesn't exist
            return next(error);
        }

        res.status(200).json({ success: true, data: {} });

    } catch (error) {
        next(error);
    }
    // 63e6933f9b181bbc43bbd2f0

}