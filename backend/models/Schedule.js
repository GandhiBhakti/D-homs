const db = require('../config/database');

class Schedule {
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT ds.*, d.first_name, d.last_name 
            FROM doctor_schedule ds 
            JOIN doctors d ON ds.doctor_id = d.id
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM doctor_schedule WHERE id = ?', [id]);
        return rows[0];
    }

    static async findByDoctor(doctorId) {
        const [rows] = await db.execute('SELECT * FROM doctor_schedule WHERE doctor_id = ?', [doctorId]);
        return rows;
    }

    static async create(scheduleData) {
        const { doctor_id, day_of_week, start_time, end_time, max_patients, is_active } = scheduleData;
        const [result] = await db.execute(
            'INSERT INTO doctor_schedule (doctor_id, day_of_week, start_time, end_time, max_patients, is_active) VALUES (?, ?, ?, ?, ?, ?)',
            [doctor_id, day_of_week, start_time, end_time, max_patients, is_active]
        );
        return { id: result.insertId, ...scheduleData };
    }

    static async update(id, scheduleData) {
        const { doctor_id, day_of_week, start_time, end_time, max_patients, is_active } = scheduleData;
        await db.execute(
            'UPDATE doctor_schedule SET doctor_id = ?, day_of_week = ?, start_time = ?, end_time = ?, max_patients = ?, is_active = ? WHERE id = ?',
            [doctor_id, day_of_week, start_time, end_time, max_patients, is_active, id]
        );
        return { id, ...scheduleData };
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM doctor_schedule WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Schedule;
