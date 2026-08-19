const DoctorCommission = require('../models/DoctorCommission');

// Get all commissions
exports.getAllCommissions = async (req, res) => {
    try {
        const filters = req.query;
        const commissions = await DoctorCommission.findAll(filters);
        res.json(commissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get commission by ID
exports.getCommissionById = async (req, res) => {
    try {
        const commission = await DoctorCommission.findById(req.params.id);
        if (!commission) {
            return res.status(404).json({ error: 'Commission not found' });
        }
        res.json(commission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get commissions by doctor ID
exports.getCommissionsByDoctor = async (req, res) => {
    try {
        const commission = await DoctorCommission.findByDoctorId(req.params.doctorId);
        if (!commission) {
            return res.status(404).json({ error: 'Commission not found for this doctor' });
        }
        res.json(commission);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new commission
exports.createCommission = async (req, res) => {
    try {
        const commission = await DoctorCommission.create(req.body);
        res.status(201).json(commission);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update commission
exports.updateCommission = async (req, res) => {
    try {
        const commission = await DoctorCommission.update(req.params.id, req.body);
        if (!commission) {
            return res.status(404).json({ error: 'Commission not found' });
        }
        res.json(commission);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete commission
exports.deleteCommission = async (req, res) => {
    try {
        const result = await DoctorCommission.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Commission not found' });
        }
        res.json({ message: 'Commission deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Calculate commission for a doctor
exports.calculateCommission = async (req, res) => {
    try {
        const { doctor_id, amount, type = 'opd', cost = 0 } = req.body;
        
        if (!doctor_id || !amount) {
            return res.status(400).json({ error: 'doctor_id and amount are required' });
        }
        
        const commissionAmount = await DoctorCommission.calculateCommission(doctor_id, amount, type, cost);
        
        res.json({
            doctor_id,
            amount,
            type,
            commission_amount: commissionAmount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
