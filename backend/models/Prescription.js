const db = require('../config/database');

class Prescription {
    static async findAll(filters = {}) {
        let query = `
            SELECT p.*, 
                   pat.first_name as patient_first_name, 
                   pat.last_name as patient_last_name,
                   pat.phone as patient_phone,
                   doc.first_name as doctor_first_name,
                   doc.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN patients pat ON p.patient_id = pat.id
            LEFT JOIN doctors doc ON p.doctor_id = doc.id
        `;
        const params = [];

        if (filters.doctor_id) {
            query += ' WHERE p.doctor_id = ?';
            params.push(filters.doctor_id);
        }

        if (filters.date_from) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' DATE(p.created_at) >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' DATE(p.created_at) <= ?';
            params.push(filters.date_to);
        }

        if (filters.patient_id) {
            query += (params.length > 0 ? ' AND' : ' WHERE') + ' p.patient_id = ?';
            params.push(filters.patient_id);
        }

        query += ' ORDER BY p.created_at DESC';

        const [rows] = await db.execute(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(`
            SELECT p.*, 
                   pat.first_name as patient_first_name, 
                   pat.last_name as patient_last_name,
                   pat.phone as patient_phone,
                   pat.address as patient_address,
                   pat.date_of_birth as patient_dob,
                   pat.gender as patient_gender,
                   doc.first_name as doctor_first_name,
                   doc.last_name as doctor_last_name,
                   doc.phone as doctor_phone,
                   dept.name as department_name
            FROM prescriptions p
            LEFT JOIN patients pat ON p.patient_id = pat.id
            LEFT JOIN doctors doc ON p.doctor_id = doc.id
            LEFT JOIN departments dept ON doc.department_id = dept.id
            WHERE p.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByPatientId(patientId) {
        const [rows] = await db.execute(`
            SELECT p.*, 
                   doc.first_name as doctor_first_name,
                   doc.last_name as doctor_last_name
            FROM prescriptions p
            LEFT JOIN doctors doc ON p.doctor_id = doc.id
            WHERE p.patient_id = ?
            ORDER BY p.created_at DESC
        `, [patientId]);
        return rows;
    }

    static async create(prescriptionData) {
        const {
            patient_id,
            patient_name,
            doctor_id,
            visit_type,
            visit_id,
            chief_complaint,
            diagnosis,
            prescription_details,
            lab_tests,
            xray_tests,
            other_tests,
            notes,
            follow_up_date,
            total_amount,
            consultation_fee,
            lab_fee,
            xray_fee,
            other_fee
        } = prescriptionData;

        // If no patient_id provided, use a default or handle accordingly
        const finalPatientId = patient_id || null;

        const [result] = await db.execute(
            `INSERT INTO prescriptions (
                patient_id, doctor_id, visit_type, visit_id, chief_complaint, diagnosis,
                prescription_details, lab_tests, xray_tests, other_tests, notes,
                follow_up_date, total_amount, consultation_fee, lab_fee, xray_fee, other_fee
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                finalPatientId, doctor_id, visit_type, visit_id, chief_complaint, diagnosis,
                prescription_details, lab_tests, xray_tests, other_tests, notes,
                follow_up_date, total_amount, consultation_fee, lab_fee, xray_fee, other_fee
            ]
        );
        return { id: result.insertId, ...prescriptionData };
    }

    static async update(id, prescriptionData) {
        const {
            chief_complaint,
            diagnosis,
            prescription_details,
            lab_tests,
            xray_tests,
            other_tests,
            notes,
            follow_up_date,
            total_amount,
            consultation_fee,
            lab_fee,
            xray_fee,
            other_fee
        } = prescriptionData;

        await db.execute(
            `UPDATE prescriptions SET 
                chief_complaint = ?, diagnosis = ?, prescription_details = ?,
                lab_tests = ?, xray_tests = ?, other_tests = ?, notes = ?,
                follow_up_date = ?, total_amount = ?, consultation_fee = ?,
                lab_fee = ?, xray_fee = ?, other_fee = ?
            WHERE id = ?`,
            [
                chief_complaint, diagnosis, prescription_details,
                lab_tests, xray_tests, other_tests, notes,
                follow_up_date, total_amount, consultation_fee,
                lab_fee, xray_fee, other_fee, id
            ]
        );
        return { id, ...prescriptionData };
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM prescriptions WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getDoctorStats(doctorId, filters = {}) {
        let query = `
            SELECT 
                COUNT(*) as total_prescriptions,
                SUM(total_amount) as total_amount,
                SUM(consultation_fee) as total_consultation_fee,
                SUM(lab_fee) as total_lab_fee,
                SUM(xray_fee) as total_xray_fee,
                SUM(other_fee) as total_other_fee,
                DATE(created_at) as date
            FROM prescriptions
            WHERE doctor_id = ?
        `;
        const params = [doctorId];

        if (filters.date_from) {
            query += ' AND DATE(created_at) >= ?';
            params.push(filters.date_from);
        }

        if (filters.date_to) {
            query += ' AND DATE(created_at) <= ?';
            params.push(filters.date_to);
        }

        if (filters.group_by_date) {
            query += ' GROUP BY DATE(created_at) ORDER BY date DESC';
        } else {
            query += ' GROUP BY doctor_id';
        }

        const [rows] = await db.execute(query, params);
        return rows;
    }
}

module.exports = Prescription;
