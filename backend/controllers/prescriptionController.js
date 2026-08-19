const Prescription = require('../models/Prescription');

// Get all prescriptions with optional filters
exports.getAllPrescriptions = async (req, res) => {
    try {
        const { doctor_id, date_from, date_to, patient_id } = req.query;
        const filters = {};
        
        if (doctor_id) filters.doctor_id = doctor_id;
        if (date_from) filters.date_from = date_from;
        if (date_to) filters.date_to = date_to;
        if (patient_id) filters.patient_id = patient_id;
        
        const prescriptions = await Prescription.findAll(filters);
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get prescription by ID
exports.getPrescriptionById = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get prescriptions by patient ID
exports.getPrescriptionsByPatientId = async (req, res) => {
    try {
        const prescriptions = await Prescription.findByPatientId(req.params.patientId);
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new prescription
exports.createPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.create(req.body);
        res.status(201).json(prescription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update prescription
exports.updatePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.update(req.params.id, req.body);
        if (!prescription) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json(prescription);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete prescription
exports.deletePrescription = async (req, res) => {
    try {
        const result = await Prescription.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Prescription not found' });
        }
        res.json({ message: 'Prescription deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get doctor statistics
exports.getDoctorStats = async (req, res) => {
    try {
        const { doctor_id, date_from, date_to, group_by_date } = req.query;
        
        if (!doctor_id) {
            return res.status(400).json({ error: 'Doctor ID is required' });
        }
        
        const filters = {};
        if (date_from) filters.date_from = date_from;
        if (date_to) filters.date_to = date_to;
        if (group_by_date) filters.group_by_date = true;
        
        const stats = await Prescription.getDoctorStats(doctor_id, filters);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
