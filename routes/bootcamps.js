const express = require('express');
const router = express.Router();
const { 
    getBootcampById, 
    getBootcamps, 
    updateBootcamp, 
    createBootcamp, 
    deleteBootcamp,
} = require('../controllers/bootcamps')

router.route('/')
    .get(getBootcamps)
    .post(createBootcamp);


router.route('/:id')
    .get(getBootcampById)
    .put(updateBootcamp)
    .delete(deleteBootcamp);

module.exports = router;