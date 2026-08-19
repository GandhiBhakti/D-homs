const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Commission routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), commissionController.getAllCommissions);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), commissionController.getCommissionById);
router.get('/doctor/:doctorId', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), commissionController.getCommissionsByDoctor);
router.post('/', authMiddleware, roleMiddleware(['admin', 'staff']), commissionController.createCommission);
router.post('/calculate', authMiddleware, roleMiddleware(['admin', 'staff']), commissionController.calculateCommission);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'staff']), commissionController.updateCommission);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), commissionController.deleteCommission);

module.exports = router;
