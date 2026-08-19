const express = require('express');
const router = express.Router();
const receptionistController = require('../controllers/receptionistController');
const authMiddleware = require('../middleware/authMiddleware');

// Receptionist dashboard routes
router.get('/dashboard-stats', authMiddleware, receptionistController.getDashboardStats);
router.get('/recent-patients', authMiddleware, receptionistController.getRecentPatients);
router.get('/today-appointments', authMiddleware, receptionistController.getTodayAppointments);
router.get('/doctor-availability', authMiddleware, receptionistController.getDoctorAvailability);

module.exports = router;
