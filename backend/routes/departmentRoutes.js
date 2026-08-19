const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Department CRUD routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor', 'receptionist']), departmentController.getAllDepartments);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor', 'receptionist']), departmentController.getDepartmentById);
router.post('/', authMiddleware, roleMiddleware(['admin']), departmentController.createDepartment);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), departmentController.updateDepartment);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), departmentController.deleteDepartment);

module.exports = router;
