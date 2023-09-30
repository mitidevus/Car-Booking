import express from "express";
import {
    createDriver,
    deleteDriver,
    getDriver,
    getDrivers,
    updateDriver,
    findNearestDrivers
} from "../controller/driverController.js"

import Driver from "../models/driverModels.js";
// import { createError } from "../utils/error.js";

const router = express.Router();
// router.get("/", (req, res) => { res.send("Hello") })
// // Create driver:
router.post("/create", createDriver);

// Update driver:
router.put("/:id", updateDriver);

// Delete driver:
router.delete("/delete/:id", deleteDriver);

// Get driver by ID:
router.get("/find/:id", getDriver);

// Get all drivers:
router.get("/getall", getDrivers);
router.get("/getNearest", findNearestDrivers);
export default router;