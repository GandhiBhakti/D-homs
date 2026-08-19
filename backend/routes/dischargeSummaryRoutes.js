const express = require('express');
const router = express.Router();
const dischargeSummaryController = require('../controllers/dischargeSummaryController');

// Discharge summary CRUD routes
router.get('/', dischargeSummaryController.getAllDischargeSummaries);
router.get('/:id', dischargeSummaryController.getDischargeSummaryById);
router.get('/patient/:patientId', dischargeSummaryController.getDischargeSummariesByPatient);
router.post('/', dischargeSummaryController.createDischargeSummary);
router.put('/:id', dischargeSummaryController.updateDischargeSummary);
router.delete('/:id', dischargeSummaryController.deleteDischargeSummary);

module.exports = router;
