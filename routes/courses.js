const express = require('express');
const router = express.Router({ mergeParams: true });
const { 
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');

const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');


router.route('/')
    .get(advancedResults(Course, { path: 'bootcamp', select: 'name description' }), getCourses)
    .post(protect, addCourse);


router.route('/:id')
    .get(getCourse)
    .put(protect, updateCourse)
    .delete(protect, deleteCourse);



module.exports = router;