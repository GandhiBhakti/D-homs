const DischargeSummary = require('../models/DischargeSummary');

// Get all discharge summaries
exports.getAllDischargeSummaries = async (req, res) => {
    try {
        const filters = req.query;
        const summaries = await DischargeSummary.findAll(filters);
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get discharge summary by ID
exports.getDischargeSummaryById = async (req, res) => {
    try {
        const summary = await DischargeSummary.findById(req.params.id);
        if (!summary) {
            return res.status(404).json({ error: 'Discharge summary not found' });
        }
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new discharge summary
exports.createDischargeSummary = async (req, res) => {
    try {
        const summary = await DischargeSummary.create(req.body);
        res.status(201).json(summary);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update discharge summary
exports.updateDischargeSummary = async (req, res) => {
    try {
        const summary = await DischargeSummary.update(req.params.id, req.body);
        if (!summary) {
            return res.status(404).json({ error: 'Discharge summary not found' });
        }
        res.json(summary);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete discharge summary
exports.deleteDischargeSummary = async (req, res) => {
    try {
        const result = await DischargeSummary.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Discharge summary not found' });
        }
        res.json({ message: 'Discharge summary deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get discharge summaries by patient ID
exports.getDischargeSummariesByPatient = async (req, res) => {
    try {
        const summaries = await DischargeSummary.getByPatientId(req.params.patientId);
        res.json(summaries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
