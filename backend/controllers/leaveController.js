const Leave = require('../models/Leave');
const db = require('../config/database');

// Get all leaves
exports.getAllLeaves = async (req, res) => {
    try {
        let leaves;
        if (req.user && req.user.role === 'doctor') {
            // Doctors can only see their own leaves
            // First get the doctor_id from the doctors table using user_id
            const [doctorRows] = await db.execute(
                'SELECT id FROM doctors WHERE user_id = ?',
                [req.user.id]
            );
            if (doctorRows.length === 0) {
                // If no doctor profile found, return empty array
                console.log('No doctor profile found for user_id:', req.user.id);
                return res.json([]);
            }
            const doctorId = doctorRows[0].id;
            leaves = await Leave.findByDoctor(doctorId);
            console.log('Leaves for doctor', doctorId, ':', leaves);
        } else {
            // Admin and staff can see all leaves
            leaves = await Leave.findAll();
        }
        res.json(leaves);
    } catch (error) {
        console.error('Error in getAllLeaves:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get leave by ID
exports.getLeaveById = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        // All authenticated users can view any leave
        res.json(leave);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get leaves by doctor ID
exports.getLeavesByDoctor = async (req, res) => {
    try {
        // All authenticated users can view leaves for any doctor
        const leaves = await Leave.findByDoctor(req.params.doctorId);
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new leave request
exports.createLeave = async (req, res) => {
    try {
        if (req.user && req.user.role === 'doctor') {
            // Doctors can only create leave for themselves
            const [doctorRows] = await db.execute(
                'SELECT id FROM doctors WHERE user_id = ?',
                [req.user.id]
            );
            if (doctorRows.length === 0) {
                return res.status(403).json({ error: 'Doctor profile not found' });
            }
            req.body.doctor_id = doctorRows[0].id;
        }
        const leave = await Leave.create(req.body);
        res.status(201).json(leave);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update leave
exports.updateLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        if (req.user && req.user.role === 'doctor') {
            // Doctors can only update their own leaves
            const [doctorRows] = await db.execute(
                'SELECT id FROM doctors WHERE user_id = ?',
                [req.user.id]
            );
            if (doctorRows.length === 0 || leave.doctor_id !== doctorRows[0].id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const updatedLeave = await Leave.update(req.params.id, req.body);
        res.json(updatedLeave);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Approve/Reject leave
exports.updateLeaveStatus = async (req, res) => {
    try {
        // Allow admin, staff, and doctors to approve/reject leaves
        const { status, approved_by } = req.body;
        const leave = await Leave.updateStatus(req.params.id, status, approved_by);
        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }
        res.json(leave);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete leave
exports.deleteLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ error: 'Leave not found' });
        }

        if (req.user && req.user.role === 'doctor') {
            // Doctors can only delete their own leaves
            const [doctorRows] = await db.execute(
                'SELECT id FROM doctors WHERE user_id = ?',
                [req.user.id]
            );
            if (doctorRows.length === 0 || leave.doctor_id !== doctorRows[0].id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const result = await Leave.delete(req.params.id);
        res.json({ message: 'Leave deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
