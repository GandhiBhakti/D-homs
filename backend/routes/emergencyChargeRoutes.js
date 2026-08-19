const express = require('express');
const router = express.Router();
const emergencyChargeController = require('../controllers/emergencyChargeController');
const { isAdmin } = require('../middleware/adminAuth');

// Emergency charge CRUD routes
router.get('/', emergencyChargeController.getAllEmergencyCharges);
router.get('/:id', emergencyChargeController.getEmergencyChargeById);
router.post('/', isAdmin, emergencyChargeController.createEmergencyCharge);
router.put('/:id', isAdmin, emergencyChargeController.updateEmergencyCharge);
router.delete('/:id', isAdmin, emergencyChargeController.deleteEmergencyCharge);
router.put('/update-amount', isAdmin, emergencyChargeController.updateChargeAmount);

module.exports = router;
