import express from 'express';
import {
    coordinate,
    createCallCenter,
    deleteCallCenterById,
    getAllCallCenters,
    getCallCenterById,
    getCallCentersByPhone,
    getTop5AddressesByPhone,
    updateCallCenterById
} from '../controllers/call-center.controller.js';
const router = express.Router();

// Create a new call center
router.post('/', createCallCenter);

// Get all call centers
router.get('/', getAllCallCenters);

// Get call center by id
router.get('/:id', getCallCenterById);

// Update call center by id
router.put('/:id', updateCallCenterById);

// Delete call center by id
router.delete('/:id', deleteCallCenterById);

// Get call center by phone
router.get('/phone/:phone', getCallCentersByPhone);

// Get top 5 addresses by phone
router.get('/top5/:phone', getTop5AddressesByPhone);

// Coordinate
router.post('/coordinate', coordinate);

export default router;
