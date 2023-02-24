const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');


// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { // Check if token is in the header and it follows the Bearer convention format
        token = req.headers.authorization.split(' ')[1];
    // } else if (req.cookies.token) { // Check if token is in the cookie
    //     token = req.cookies.token;
    }

    // Make sure token exists
    if (!token) return next(new ErrorResponse('Not authorized to access this route', 401));

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded);
        req.user = await User.findById(decoded.id);

        next();

    } catch (error) {
        next(new ErrorResponse('Not authorized to access this route', 401));
    }

});