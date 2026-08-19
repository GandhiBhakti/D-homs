const Investigation = require('../models/Investigation');

// Get all investigations
exports.getAllInvestigations = async (req, res) => {
    try {
        const filters = req.query;
        const investigations = await Investigation.findAll(filters);
        res.json(investigations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get investigation by ID
exports.getInvestigationById = async (req, res) => {
    try {
        const investigation = await Investigation.findById(req.params.id);
        if (!investigation) {
            return res.status(404).json({ error: 'Investigation not found' });
        }
        res.json(investigation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new investigation
exports.createInvestigation = async (req, res) => {
    try {
        const investigation = await Investigation.create(req.body);
        res.status(201).json(investigation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update investigation
exports.updateInvestigation = async (req, res) => {
    try {
        const investigation = await Investigation.update(req.params.id, req.body);
        if (!investigation) {
            return res.status(404).json({ error: 'Investigation not found' });
        }
        res.json(investigation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete investigation
exports.deleteInvestigation = async (req, res) => {
    try {
        const result = await Investigation.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Investigation not found' });
        }
        res.json({ message: 'Investigation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get investigations by date range
exports.getInvestigationsByDateRange = async (req, res) => {
    try {
        const { startDate, endDate, investigationType } = req.query;
        const investigations = await Investigation.getByDateRange(startDate, endDate, investigationType);
        res.json(investigations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
