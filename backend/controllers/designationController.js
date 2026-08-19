const Designation = require('../models/Designation');

// Get all designations
exports.getAllDesignations = async (req, res) => {
    try {
        const designations = await Designation.findAll();
        res.json(designations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get designation by ID
exports.getDesignationById = async (req, res) => {
    try {
        const designation = await Designation.findById(req.params.id);
        if (!designation) {
            return res.status(404).json({ error: 'Designation not found' });
        }
        res.json(designation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new designation
exports.createDesignation = async (req, res) => {
    try {
        const designation = await Designation.create(req.body);
        res.status(201).json(designation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update designation
exports.updateDesignation = async (req, res) => {
    try {
        const designation = await Designation.update(req.params.id, req.body);
        if (!designation) {
            return res.status(404).json({ error: 'Designation not found' });
        }
        res.json(designation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete designation
exports.deleteDesignation = async (req, res) => {
    try {
        const result = await Designation.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Designation not found' });
        }
        res.json({ message: 'Designation deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
