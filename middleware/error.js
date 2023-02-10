const ErrorResponse = require("../utils/errorResponse");

function errorHandler(err, req, res, next) {
    let error = { ...err };
    error.message = err.message;
    // Log for the developer
    console.log(err.stack.red);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const msg = `Bootcamp not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key entered
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';

        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(value => value.message);

        error = new ErrorResponse(message, 400);
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;