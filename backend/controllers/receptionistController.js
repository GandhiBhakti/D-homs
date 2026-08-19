const db = require('../config/database');

// Get receptionist dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's OPD count
        const [opdCount] = await db.execute(
            'SELECT COUNT(*) as count FROM patient_visits WHERE visit_type = "OPD" AND visit_date = ?',
            [today]
        );
        
        // Get today's IPD count
        const [ipdCount] = await db.execute(
            'SELECT COUNT(*) as count FROM patient_visits WHERE visit_type = "IPD" AND admission_date = ?',
            [today]
        );
        
        // Get total active patients
        const [activePatients] = await db.execute(
            'SELECT COUNT(*) as count FROM patient_visits WHERE status = "active"'
        );
        
        // Get today's appointments
        const [appointments] = await db.execute(
            'SELECT COUNT(*) as count FROM doctor_availability WHERE date = ? AND status = "available"',
            [today]
        );
        
        res.json({
            todayOPD: opdCount[0].count,
            todayIPD: ipdCount[0].count,
            activePatients: activePatients[0].count,
            availableAppointments: appointments[0].count
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get recent patients for receptionist
exports.getRecentPatients = async (req, res) => {
    try {
        const [patients] = await db.execute(
            `SELECT pv.*, p.first_name, p.last_name, p.phone, p.patient_id,
                    d.first_name as doctor_first_name, d.last_name as doctor_last_name,
                    dept.name as department_name
             FROM patient_visits pv
             JOIN patients p ON pv.patient_id = p.id
             LEFT JOIN doctors d ON pv.doctor_id = d.id
             LEFT JOIN departments dept ON pv.department_id = dept.id
             ORDER BY pv.created_at DESC
             LIMIT 20`
        );
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get today's appointments
exports.getTodayAppointments = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        const [appointments] = await db.execute(
            `SELECT da.*, d.first_name as doctor_first_name, d.last_name as doctor_last_name,
                    ds.day_of_week, ds.start_time, ds.end_time
             FROM doctor_availability da
             JOIN doctors d ON da.doctor_id = d.id
             LEFT JOIN doctor_schedule ds ON d.id = ds.doctor_id
             WHERE da.date = ? AND da.status = 'available'
             ORDER BY da.start_time`,
            [today]
        );
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get doctor availability status
exports.getDoctorAvailability = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        
        const [doctors] = await db.execute(
            `SELECT d.id, d.first_name, d.last_name, d.specialization, d.is_available,
                    da.status as availability_status, da.date as availability_date,
                    da.start_time as available_start, da.end_time as available_end,
                    dl.status as leave_status, dl.start_date as leave_start, dl.end_date as leave_end
             FROM doctors d
             LEFT JOIN doctor_availability da ON d.id = da.doctor_id AND da.date = ?
             LEFT JOIN doctor_leaves dl ON d.id = dl.doctor_id 
                AND dl.status = 'approved' 
                AND dl.start_date <= ? AND dl.end_date >= ?
             WHERE d.is_available = 1
             ORDER BY d.first_name, d.last_name`,
            [today, today, today]
        );

        // Process availability status for each doctor
        const doctorsWithStatus = doctors.map(doctor => {
            let status = 'Available';
            let statusColor = 'green';
            
            // Check if on leave
            if (doctor.leave_status === 'approved') {
                status = 'On Leave';
                statusColor = 'red';
            }
            // Check if has availability for today
            else if (doctor.availability_status === 'available') {
                status = 'In Hospital';
                statusColor = 'green';
            }
            // Check if scheduled but not available
            else if (doctor.availability_status === 'unavailable') {
                status = 'Not Available';
                statusColor = 'orange';
            }
            // Default to available if doctor is marked as available
            else if (doctor.is_available) {
                status = 'Available';
                statusColor = 'green';
            }
            
            return {
                ...doctor,
                current_status: status,
                status_color: statusColor
            };
        });

        res.json(doctorsWithStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
