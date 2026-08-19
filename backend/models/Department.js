const db = require('../config/database');

class Department {
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM departments');
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute('SELECT * FROM departments WHERE id = ?', [id]);
        return rows[0];
    }

    static async create(departmentData) {
        const { name, description } = departmentData;
        const [result] = await db.execute(
            'INSERT INTO departments (name, description) VALUES (?, ?)',
            [name, description]
        );
        return { id: result.insertId, ...departmentData };
    }

    static async update(id, departmentData) {
        const { name, description } = departmentData;
        await db.execute(
            'UPDATE departments SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );
        return { id, ...departmentData };
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM departments WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Department;
