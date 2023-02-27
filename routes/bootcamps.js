const express = require('express');
const router = express.Router();
const { 
    getBootcampById, 
    getBootcamps, 
    updateBootcamp, 
    createBootcamp, 
    deleteBootcamp,
    getbootcampsWithinRadius,
    bootcampPhotoUpload,
} = require('../controllers/bootcamps');

// Routes that require the user to be logged in have the protect middleware applied

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const courseRouter = require('./courses');

const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getbootcampsWithinRadius);

router.route('/:id/photo')
    .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);


router.route('/:id')
    .get(getBootcampById)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;