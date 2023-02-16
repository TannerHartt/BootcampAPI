const path = require('path');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');

// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {

    // Copy req.query
    const reqQuery = { ...req.query };

    // Field to exclude
    const removeFields = ['select', 'sort', 'limit', 'page'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, $lt, $lte, $in)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    // Finding resource 
    let query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1; // If page is not specified, default to 1
    const limit = parseInt(req.query.limit, 10) || 25; // If limit is not specified, default to 25
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Bootcamp.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const bootcamps = await query;

    // Pagination result
    const pagination = {
        limit,
        prev: startIndex > 0 ? page - 1 : null,
        next: endIndex < total ? page + 1 : null,
        current: page,
        query: req.url,
        total
    };

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({ 
        success: true, 
        count: bootcamps.length, 
        pagination, 
        data: bootcamps });
});

// @desc    Get a bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcampById = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) { // If id is correctly formatted but doesn't exist
        return next(error);
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// @desc    Update a new bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!bootcamp) { // If id is correctly formatted but doesn't exist
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id); // findByIdAndDelete doesn't trigger middleware

    if (!bootcamp) { // If id is correctly formatted but doesn't exist
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    bootcamp.remove(); // Remove from database and trigger middleware

    res.status(200).json({ success: true, data: {} });
});


// @desc    Get bootcamps within a radius
// @route   DELETE /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
exports.getbootcampsWithinRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/long from geocoder
    const loc = await geocoder.geocode(zipcode);
    const latitude = loc[0].latitude;
    const longitude = loc[0].longitude;

    // Calculate radius in radians
    // Divide distance by radius of Earth - which equals 3,963 mi or 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [
                        longitude,
                        latitude
                    ],
                    radius
                ]
            }
        }
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

// @desc    Uplaod a photo for a bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id); // findByIdAndDelete doesn't trigger middleware

    if (!bootcamp) { // If id is correctly formatted but doesn't exist
        return next(
            new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
        );
    }

    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename in the form of 'photo_<bootcampId>.jpg'
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`; // path.parse(file.name).ext gets the extension


    // Move file to the specified path
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
          console.error("Error: ", err);
          console.error("File: ", file);
        
          return next(new ErrorResponse(`Problem with file upload`, 500));
        }
    
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    
        res.status(200).json({
          success: true,
          data: file.name
        });
    });
});