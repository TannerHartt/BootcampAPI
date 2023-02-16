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

const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('../middleware/advancedResults');

// Include other resource routers
const courseRouter = require('./courses');

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance')
    .get(getbootcampsWithinRadius);

router.route('/:id/photo')
    .put(bootcampPhotoUpload);

router.route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(createBootcamp);


router.route('/:id')
    .get(getBootcampById)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;