// @desc    Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = (req, res, next) => {
    res.status(200).json({ success: true, message: 'Show all bootcamps' });
}

// @desc    Get a bootcamp by id
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcampById = (req, res, next) => {
    res.status(200).json({ success: true, message: `Get bootcamp by ${req.params.id}` });
}

// @desc    Create a new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: 'Create a new bootcamp' });
}

// @desc    Update a new bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Update bootcamp${req.params.id}` });
}

// @desc    Delete a bootcamp
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({ success: true, message: `Delete bootcamp ${req.params.id}` });
}