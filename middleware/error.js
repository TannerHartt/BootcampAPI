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

    res.status(err.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
}

module.exports = errorHandler;