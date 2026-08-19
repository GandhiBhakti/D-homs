const db = require('../config/database');

class Designation {
    static async findAll() {
        const [rows] = await db.execute(`
            SELECT d.*, dept.name as department_name 
            FROM designations d 
            LEFT JOIN departments dept ON d.department_id = dept.id
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.execute(`
            SELECT d.*, dept.name as department_name 
            FROM designations d 
            LEFT JOIN departments dept ON d.department_id = dept.id 
            WHERE d.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(designationData) {
        const { title, description, department_id } = designationData;
        const [result] = await db.execute(
            'INSERT INTO designations (title, description, department_id) VALUES (?, ?, ?)',
            [title, description, department_id]
        );
        return { id: result.insertId, ...designationData };
    }

    static async update(id, designationData) {
        const { title, description, department_id } = designationData;
        await db.execute(
            'UPDATE designations SET title = ?, description = ?, department_id = ? WHERE id = ?',
            [title, description, department_id, id]
        );
        return { id, ...designationData };
    }

    static async delete(id) {
        const [result] = await db.execute('DELETE FROM designations WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
}

module.exports = Designation;
