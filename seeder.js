const fs = require('fs');
const mongoose = require('mongoose');
const env = require('dotenv');
const Bootcamp = require('./models/Bootcamp');

// Load env varibles
env.config({ path: './config/config.env' });

// Connect to database
mongoose.connect(process.env.MONGO_URI);

// Read json files.
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));

// Import into database
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);

        console.log('Data Imported... ');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();

        console.log('Data Destroyed... ');
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

if (process.argv[2] === '-i') {
    importData();
} else if (process.argv[2] === '-d') {
    deleteData();
}