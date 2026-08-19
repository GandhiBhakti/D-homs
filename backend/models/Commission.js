const db = require('../config/database');

class Commission {
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT dc.*, d.first_name, d.last_name 
            FROM doctor_commission dc 
            JOIN doctors d ON dc.doctor_id = d.id
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM doctor_commission WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByDoctor(doctorId) {
        const [rows] = await db.execute('SELECT * FROM doctor_commission WHERE doctor_id = ?', [doctorId]);
        return rows;
    }

    static async create(commissionData) {
        const { doctor_id, commission_type, commission_value, effective_from, effective_to, is_active, description } = commissionData;
        const [result] = await db.execute(
            'INSERT INTO doctor_commission (doctor_id, commission_type, commission_value, effective_from, effective_to, is_active, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [doctor_id, commission_type, commission_value, effective_from, effective_to, is_active, description]
        );
        return { id: result.insertId, ...commissionData };
    }

    static async update(id, commissionData) {
        const { doctor_id, commission_type, commission_value, effective_from, effective_to, is_active, description } = commissionData;
        await db.execute(
            'UPDATE doctor_commission SET doctor_id = ?, commission_type = ?, commission_value = ?, effective_from = ?, effective_to = ?, is_active = ?, description = ? WHERE id = ?',
            [doctor_id, commission_type, commission_value, effective_from, effective_to, is_active, description, id]
        );
        return { id, ...commissionData };
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM doctor_commission WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Commission;
