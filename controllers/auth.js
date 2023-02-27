const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    sendTokenResponse(user, 200, res);
});

// @desc    Register User
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) next(new ErrorResponse('Invalid credentials', 401));

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) next(new ErrorResponse('Invalid credentials, password does not match', 401));

    // Create token
    sendTokenResponse(user, 200, res);
});


// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    })
});


// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
        
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    })
});

// @desc    Update user password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) { // If current password doesn't match
        return next(new ErrorResponse('Password is incorrect', 401)); // Return error message
    }

    user.password = req.body.newPassword; // Set new password
    await user.save(); // Save new password in database

    sendTokenResponse(user, 200, res); // Send token response
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return next(new ErrorResponse('There is no user with that email', 404)); // If user with entered email doesn't exist

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`; // Message to be sent to user

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        }); // Send email to user

        res.status(200).json({
            success: true,
            data: 'Email sent'
        }); // If email is sent successfully
    } catch (error) {
        // If email is not sent successfully
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false }); // Update user fields in database

        return next(new ErrorResponse('Email could not be sent', 500));
    }

    res.status(200).json({
        success: true,
        data: user
    })
});


// @desc    Reset passwrod
// @route   GET /api/v1/auth/mresetpassword/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {

    // Get hashed token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({ // Find user with reset token in database
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return next(new ErrorResponse('Invalid token', 400)); // If user with entered email doesn't exist

    // If token has not expired, and there is user, set the new password
    // Set new password
    user.password = req.body.password;

    // Password was reset, so remove reset token and expire
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // Save user in database with new password and reset token and expire

    sendTokenResponse(user, 200, res); // Send token response

    res.status(200).json({
        success: true,
        data: user
    })
});


// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {

    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') options.secure = true;

    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
    });
};