const Schedule = require('../models/Schedule');

// Get all schedules
exports.getAllSchedules = async (req, res) => {
    try {
        let schedules;
        if (req.user && req.user.role === 'doctor') {
            schedules = await Schedule.findByDoctor(req.user.doctor_id);
        } else if (req.user && req.user.role === 'staff') {
            // Staff can see all schedules
            schedules = await Schedule.findAll();
        } else {
            schedules = await Schedule.findAll();
        }
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get schedule by ID
exports.getScheduleById = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        if (req.user && req.user.role === 'doctor' && schedule.doctor_id !== req.user.doctor_id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get schedules by doctor ID
exports.getSchedulesByDoctor = async (req, res) => {
    try {
        if (req.user && req.user.role === 'doctor' && req.params.doctorId != req.user.doctor_id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const schedules = await Schedule.findByDoctor(req.params.doctorId);
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new schedule
exports.createSchedule = async (req, res) => {
    try {
        if (req.user && req.user.role === 'doctor') {
            req.body.doctor_id = req.user.doctor_id;
        }
        const schedule = await Schedule.create(req.body);
        res.status(201).json(schedule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update schedule
exports.updateSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        if (req.user && req.user.role === 'doctor' && schedule.doctor_id !== req.user.doctor_id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const updatedSchedule = await Schedule.update(req.params.id, req.body);
        res.json(updatedSchedule);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete schedule
exports.deleteSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        if (req.user && req.user.role === 'doctor' && schedule.doctor_id !== req.user.doctor_id) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const result = await Schedule.delete(req.params.id);
        res.json({ message: 'Schedule deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
