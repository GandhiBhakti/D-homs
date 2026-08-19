const express = require('express');
const router = express.Router();
const investigationController = require('../controllers/investigationController');

// Investigation CRUD routes
router.get('/', investigationController.getAllInvestigations);
router.get('/date-range', investigationController.getInvestigationsByDateRange);
router.get('/:id', investigationController.getInvestigationById);
router.post('/', investigationController.createInvestigation);
router.put('/:id', investigationController.updateInvestigation);
router.delete('/:id', investigationController.deleteInvestigation);

module.exports = router;
