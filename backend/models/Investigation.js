const db = require("../config/database");

class Investigation {
  static async findAll(filters = {}) {
    let query = `
      SELECT i.*, 
             pv.patient_id,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             pv.visit_date
      FROM investigations i
      LEFT JOIN patient_visits pv ON i.patient_visit_id = pv.id
      LEFT JOIN patients p ON i.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.patient_id) {
      query += " AND i.patient_id = ?";
      params.push(filters.patient_id);
    }
    if (filters.patient_visit_id) {
      query += " AND i.patient_visit_id = ?";
      params.push(filters.patient_visit_id);
    }
    if (filters.investigation_type) {
      query += " AND i.investigation_type = ?";
      params.push(filters.investigation_type);
    }
    if (filters.status) {
      query += " AND i.status = ?";
      params.push(filters.status);
    }
    if (filters.start_date) {
      query += " AND DATE(i.created_at) >= ?";
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += " AND DATE(i.created_at) <= ?";
      params.push(filters.end_date);
    }

    query += " ORDER BY i.created_at DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT i.*, 
             pv.patient_id,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             pv.visit_date
      FROM investigations i
      LEFT JOIN patient_visits pv ON i.patient_visit_id = pv.id
      LEFT JOIN patients p ON i.patient_id = p.id
      WHERE i.id = ?
    `,
      [id]
    );
    return rows[0];
  }

  static async create(investigationData) {
    const {
      patient_visit_id,
      patient_id,
      investigation_type,
      investigation_name,
      number_of_xrays = 1,
      notes,
      status = 'pending'
    } = investigationData;

    const [result] = await db.execute(
      `INSERT INTO investigations (patient_visit_id, patient_id, investigation_type, investigation_name, number_of_xrays, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_visit_id || null,
        patient_id || null,
        investigation_type,
        investigation_name,
        number_of_xrays,
        notes || null,
        status
      ]
    );

    return {
      id: result.insertId,
      ...investigationData
    };
  }

  static async update(id, investigationData) {
    const {
      investigation_type,
      investigation_name,
      number_of_xrays,
      notes,
      status
    } = investigationData;

    await db.execute(
      `UPDATE investigations SET investigation_type = ?, investigation_name = ?, number_of_xrays = ?, notes = ?, status = ? WHERE id = ?`,
      [
        investigation_type,
        investigation_name,
        number_of_xrays,
        notes,
        status,
        id
      ]
    );

    return { id, ...investigationData };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM investigations WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getByDateRange(startDate, endDate, investigationType = null) {
    let query = `
      SELECT DATE(created_at) as date, investigation_type, COUNT(*) as count
      FROM investigations
      WHERE DATE(created_at) BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (investigationType) {
      query += " AND investigation_type = ?";
      params.push(investigationType);
    }

    query += " GROUP BY DATE(created_at), investigation_type ORDER BY date DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = Investigation;
