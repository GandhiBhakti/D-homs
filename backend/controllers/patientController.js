const Patient = require('../models/Patient');

// Get all patients
exports.getAllPatients = async (req, res) => {
    try {
        console.log('Fetching all patients...');
        const patients = await Patient.findAll();
        console.log('Patients found:', patients.length);
        // Calculate age for each patient
        const patientsWithAge = patients.map(patient => ({
            ...patient,
            age: Patient.calculateAge(patient.date_of_birth)
        }));
        res.json(patientsWithAge);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get patient by ID
exports.getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        const patientWithAge = {
            ...patient,
            age: Patient.calculateAge(patient.date_of_birth)
        };
        res.json(patientWithAge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new patient
exports.createPatient = async (req, res) => {
    try {
        const patient = await Patient.create(req.body);
        res.status(201).json(patient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update patient
exports.updatePatient = async (req, res) => {
    try {
        const patient = await Patient.update(req.params.id, req.body);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete patient
exports.deletePatient = async (req, res) => {
    try {
        const result = await Patient.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Patient not found' });
        }
        res.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
