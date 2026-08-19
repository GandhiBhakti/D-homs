const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');

// Report routes
router.get('/dashboard', reportsController.getDashboardReport);
router.get('/opd-collection', reportsController.getOPDCollectionReport);
router.get('/ipd-collection', reportsController.getIPDCollectionReport);
router.get('/billing', reportsController.getBillingReport);
router.get('/credit', reportsController.getCreditReport);
router.get('/advance', reportsController.getAdvanceReport);
router.get('/discount', reportsController.getDiscountReport);
router.get('/pmjay', reportsController.getPMJAYReport);
router.get('/commission', reportsController.getCommissionReport);
router.get('/patient-income', reportsController.getPatientIncomeReport);
router.get('/bed-occupancy', reportsController.getBedOccupancyReport);
router.get('/admissions-discharges', reportsController.getAdmissionsDischargesReport);

module.exports = router;
