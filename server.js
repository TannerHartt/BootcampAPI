const express = require('express');
const env = require('dotenv');
const bootcamps = require('./routes/bootcamps');
const PORT = process.env.PORT || 5000;
const morgan = require('morgan');

env.config({ path: './config/config.env' });


const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

app.listen(PORT, console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
