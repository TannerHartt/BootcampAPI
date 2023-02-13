const express = require('express');
const router = express.Router();
const { 
    getBootcampById, 
    getBootcamps, 
    updateBootcamp, 
    createBootcamp, 
    deleteBootcamp,
    getbootcampsWithinRadius,
} = require('../controllers/bootcamps');

router.route('/radius/:zipcode/:distance')
    .get(getbootcampsWithinRadius);

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);


router.route('/:id')
    .get(getBootcampById)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;