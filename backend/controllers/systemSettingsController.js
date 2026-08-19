const SystemSettings = require('../models/SystemSettings');

// Get all system settings
exports.getAllSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.findAll();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get setting by key
exports.getSettingByKey = async (req, res) => {
    try {
        const setting = await SystemSettings.findByKey(req.params.key);
        if (!setting) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        res.json(setting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get setting value
exports.getSettingValue = async (req, res) => {
    try {
        const value = await SystemSettings.getValue(req.params.key);
        if (value === null) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        res.json({ key: req.params.key, value });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new setting
exports.createSetting = async (req, res) => {
    try {
        const setting = await SystemSettings.create(req.body);
        res.status(201).json(setting);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update setting
exports.updateSetting = async (req, res) => {
    try {
        const setting = await SystemSettings.update(req.params.key, req.body);
        res.json(setting);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete setting
exports.deleteSetting = async (req, res) => {
    try {
        const result = await SystemSettings.delete(req.params.key);
        if (!result) {
            return res.status(404).json({ error: 'Setting not found' });
        }
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get advance payment settings
exports.getAdvancePaymentSettings = async (req, res) => {
    try {
        const settings = await SystemSettings.getAdvancePaymentSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
