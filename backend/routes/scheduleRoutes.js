const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Schedule routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), scheduleController.getAllSchedules);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), scheduleController.getScheduleById);
router.get('/doctor/:doctorId', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), scheduleController.getSchedulesByDoctor);
router.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), scheduleController.createSchedule);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'staff']), scheduleController.updateSchedule);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), scheduleController.deleteSchedule);

module.exports = router;
