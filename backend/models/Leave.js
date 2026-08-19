const db = require('../config/database');

class Leave {
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT dl.*, d.first_name, d.last_name, u.username as approved_by_name 
            FROM doctor_leaves dl 
            JOIN doctors d ON dl.doctor_id = d.id 
            LEFT JOIN users u ON dl.approved_by = u.id
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM doctor_leaves WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByDoctor(doctorId) {
        const [rows] = await db.execute(`
            SELECT dl.*, d.first_name, d.last_name, u.username as approved_by_name 
            FROM doctor_leaves dl 
            JOIN doctors d ON dl.doctor_id = d.id 
            LEFT JOIN users u ON dl.approved_by = u.id
            WHERE dl.doctor_id = ?
        `, [doctorId]);
        return rows;
    }

    static async create(leaveData) {
        const { doctor_id, leave_type, start_date, end_date, reason, status } = leaveData;
        const [result] = await db.execute(
            'INSERT INTO doctor_leaves (doctor_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)',
            [doctor_id, leave_type, start_date, end_date, reason, status]
        );
        return { id: result.insertId, ...leaveData };
    }

    static async update(id, leaveData) {
        const { doctor_id, leave_type, start_date, end_date, reason, status } = leaveData;
        await db.execute(
            'UPDATE doctor_leaves SET doctor_id = ?, leave_type = ?, start_date = ?, end_date = ?, reason = ?, status = ? WHERE id = ?',
            [doctor_id, leave_type, start_date, end_date, reason, status, id]
        );
        return { id, ...leaveData };
    }

    static async updateStatus(id, status, approvedBy) {
        await db.execute(
            'UPDATE doctor_leaves SET status = ?, approved_by = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, approvedBy, id]
        );
        const [rows] = await db.execute('SELECT * FROM doctor_leaves WHERE id = ?', [id]);
        return rows[0];
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM doctor_leaves WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Leave;
