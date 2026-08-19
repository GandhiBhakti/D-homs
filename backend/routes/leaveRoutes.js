const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Leave routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.getAllLeaves);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.getLeaveById);
router.get('/doctor/:doctorId', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.getLeavesByDoctor);
router.post('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.createLeave);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.updateLeave);
router.patch('/:id/status', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.updateLeaveStatus);
router.delete('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), leaveController.deleteLeave);

module.exports = router;
