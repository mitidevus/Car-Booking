import Driver from "../models/driverModels.js"
export const createDriver = async(req, res, next) => {
    const newDriver = new Driver(req.body);
    try {
        const savedDriver = await newDriver.save();
        res.status(200).json(savedDriver);
    } catch (err) {
        next(err);
    }
};

export const updateDriver = async(req, res, next) => {
    try {
        const updatedDriver = await Driver.findByIdAndUpdate(
            req.params.id, { $set: req.body }, { new: true }
        );
        if (!updatedDriver) {
            return next(createError(404, "Driver not found."));
        }
        res.status(200).json(updatedDriver);
    } catch (err) {
        next(err);
    }
};

export const deleteDriver = async(req, res, next) => {
    try {
        const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
        if (!deletedDriver) {
            return next(createError(404, "Driver not found."));
        }
        res.status(200).json("Driver has been deleted.");
    } catch (err) {
        next(err);
    }
};

export const getDriver = async(req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);
        if (!driver) {
            return next(createError(404, "Driver not found."));
        }
        res.status(200).json(driver);
    } catch (err) {
        next(err);
    }
};

export const getDrivers = async(req, res, next) => {
    try {
        const drivers = await Driver.find();
        res.status(200).json(drivers);
    } catch (err) {
        next(err);
    }
};

export const findNearestDrivers = async(longitude, latitude) => {
    try {
        const nearestDrivers = await Driver.aggregate([{
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [parseFloat(longitude), parseFloat(latitude)],
                },
                key: "destination",
                distanceField: "distance",
                maxDistance: parseFloat(1000) * 1609,
                spherical: true,
            },
        }, ]);
        return nearestDrivers;
    } catch (err) {
        throw err;
    }
};

import cron from "node-cron"

const generateRandomDestination = () => {
    const latitude = Math.random() * (180) - 90;
    const longitude = Math.random() * (360) - 180;
    return {
        type: 'Point',
        coordinates: [longitude, latitude],
    };
};

export const updateDriverDestination = async(driverId, newDestination) => {
    try {
        const driver = await Driver.findById(driverId);
        if (!driver) {
            console.error(`Driver with ID ${driverId} not found.`);
            return;
        }

        driver.destination = newDestination;
        await driver.save();
        console.log("Update finished")
            // console.log(`Driver ${driverId} destination updated: ${JSON.stringify(newDestination)}`);
    } catch (err) {
        console.error(`Error updating destination for driver ${driverId}: ${err}`);
    }
};

export const runDriverUpdateJob = async() => {
    try {
        const drivers = await Driver.find({});

        for (const driver of drivers) {
            const newDestination = generateRandomDestination();
            console.log(`Updating driver ${driver.name} destination...`);
            await updateDriverDestination(driver._id, newDestination);
        }

    } catch (error) {
        console.error('Error running driver update job:', error);
    }
};

// cron.schedule('*/5 * * * * *', async() => {
//     console.log('Running driver update job...');
//     await runDriverUpdateJob();
// });