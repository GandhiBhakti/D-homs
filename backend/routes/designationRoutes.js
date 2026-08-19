const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Designation CRUD routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor', 'receptionist']), designationController.getAllDesignations);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor', 'receptionist']), designationController.getDesignationById);
router.post('/', authMiddleware, roleMiddleware(['admin']), designationController.createDesignation);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), designationController.updateDesignation);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), designationController.deleteDesignation);

module.exports = router;
