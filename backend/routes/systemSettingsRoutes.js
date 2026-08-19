const express = require('express');
const router = express.Router();
const systemSettingsController = require('../controllers/systemSettingsController');
const { isAdmin, isAdminEditable } = require('../middleware/adminAuth');

// System settings routes
router.get('/', systemSettingsController.getAllSettings);
router.get('/key/:key', systemSettingsController.getSettingByKey);
router.get('/value/:key', systemSettingsController.getSettingValue);
router.get('/advance-payment', systemSettingsController.getAdvancePaymentSettings);
router.post('/', isAdmin, systemSettingsController.createSetting);
router.put('/key/:key', isAdminEditable, systemSettingsController.updateSetting);
router.delete('/key/:key', isAdmin, systemSettingsController.deleteSetting);

module.exports = router;
