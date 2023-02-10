const express = require('express');
const env = require('dotenv');
const bootcamps = require('./routes/bootcamps');
const PORT = process.env.PORT || 5000;
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env variables
env.config({ path: './config/config.env' });

// Connect to database
connectDB();
const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

const server = app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));



// Handle unhandled promise rejections
process.on('unhandledRejection', (error, promise) => {
    console.log(`Error: ${error.message}`);

    server.close(() => process.exit(1)); // Close server & exit
});