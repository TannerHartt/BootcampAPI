const express = require('express');
const User = require('../models/User');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router({ mergeParams: true });
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');

router.use(protect); // Protect all routes after this middleware (Anything below this line will be protected)
router.use(authorize('admin')); // Only admin can access routes below this line

router.route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser);


router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

module.exports = router;