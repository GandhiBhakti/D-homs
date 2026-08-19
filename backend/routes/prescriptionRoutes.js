const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const authMiddleware = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/roleMiddleware');

// Prescription CRUD routes
router.get('/', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), prescriptionController.getAllPrescriptions);
router.get('/stats', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), prescriptionController.getDoctorStats);
router.get('/patient/:patientId', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), prescriptionController.getPrescriptionsByPatientId);
router.get('/:id', authMiddleware, roleMiddleware(['admin', 'staff', 'doctor']), prescriptionController.getPrescriptionById);
router.post('/', authMiddleware, roleMiddleware(['admin', 'doctor']), prescriptionController.createPrescription);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'doctor']), prescriptionController.updatePrescription);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), prescriptionController.deletePrescription);

module.exports = router;
