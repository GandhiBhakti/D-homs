const express = require('express');
const router = express.Router();
const printController = require('../controllers/printController');

// Print routes
router.get('/opd-slip/:visitId', printController.getOPDSlip);
router.get('/prescription/:visitId', printController.getPrescription);
router.get('/investigation/:investigationId', printController.getInvestigationPrint);
router.get('/billing/:billId', printController.getBillingPrint);
router.get('/payment-receipt/:billId', printController.getPaymentReceipt);
router.get('/uhid-label/:patientId', printController.getUHIDLabel);
router.get('/discharge-summary/:summaryId', printController.getDischargeSummaryPrint);
router.get('/file-sticker/:patientId', printController.getFileSticker);

module.exports = router;
