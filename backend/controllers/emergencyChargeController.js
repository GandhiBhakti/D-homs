const EmergencyCharge = require('../models/EmergencyCharge');

// Get all emergency charges
exports.getAllEmergencyCharges = async (req, res) => {
    try {
        const activeOnly = req.query.active === 'true';
        const charges = await EmergencyCharge.findAll(activeOnly);
        res.json(charges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get emergency charge by ID
exports.getEmergencyChargeById = async (req, res) => {
    try {
        const charge = await EmergencyCharge.findById(req.params.id);
        if (!charge) {
            return res.status(404).json({ error: 'Emergency charge not found' });
        }
        res.json(charge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new emergency charge
exports.createEmergencyCharge = async (req, res) => {
    try {
        const charge = await EmergencyCharge.create(req.body);
        res.status(201).json(charge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update emergency charge
exports.updateEmergencyCharge = async (req, res) => {
    try {
        const charge = await EmergencyCharge.update(req.params.id, req.body);
        if (!charge) {
            return res.status(404).json({ error: 'Emergency charge not found' });
        }
        res.json(charge);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete emergency charge
exports.deleteEmergencyCharge = async (req, res) => {
    try {
        const result = await EmergencyCharge.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Emergency charge not found' });
        }
        res.json({ message: 'Emergency charge deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update charge amount by name
exports.updateChargeAmount = async (req, res) => {
    try {
        const { chargeName, newAmount } = req.body;
        if (!chargeName || newAmount === undefined) {
            return res.status(400).json({ error: 'chargeName and newAmount are required' });
        }
        const charge = await EmergencyCharge.updateChargeAmount(chargeName, newAmount);
        res.json(charge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
