const Doctor = require('../models/Doctor');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.findAll();
        res.json(doctors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get doctor by ID
exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new doctor
exports.createDoctor = async (req, res) => {
    try {
        const doctorData = req.body;
        
        // Create user account with default password for doctors
        const defaultPassword = 'doctor123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        // Create user if user_id is not provided
        if (!doctorData.user_id) {
            const username = `${doctorData.first_name.toLowerCase()}.${doctorData.last_name.toLowerCase()}`;
            const userData = {
                username: username,
                email: doctorData.email,
                password: hashedPassword,
                first_name: doctorData.first_name,
                last_name: doctorData.last_name,
                role: 'doctor',
                phone: doctorData.phone || '',
                is_active: true
            };
            
            const user = await User.create(userData);
            doctorData.user_id = user.id;
        }
        
        const doctor = await Doctor.create(doctorData);
        res.status(201).json({
            ...doctor,
            default_password: defaultPassword
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.update(req.params.id, req.body);
        if (!doctor) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json(doctor);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
    try {
        const result = await Doctor.delete(req.params.id);
        if (!result) {
            return res.status(404).json({ error: 'Doctor not found' });
        }
        res.json({ message: 'Doctor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
