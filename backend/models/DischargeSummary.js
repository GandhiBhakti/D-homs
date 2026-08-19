const db = require("../config/database");

class DischargeSummary {
  static async findAll(filters = {}) {
    let query = `
      SELECT ds.*, 
             pv.visit_date,
             pv.admission_date_time,
             pv.ward,
             pv.room,
             pv.bed,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             p.phone,
             p.gender,
             p.date_of_birth,
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name
      FROM discharge_summaries ds
      LEFT JOIN patient_visits pv ON ds.patient_visit_id = pv.id
      LEFT JOIN patients p ON ds.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.patient_id) {
      query += " AND ds.patient_id = ?";
      params.push(filters.patient_id);
    }
    if (filters.patient_visit_id) {
      query += " AND ds.patient_visit_id = ?";
      params.push(filters.patient_visit_id);
    }
    if (filters.start_date) {
      query += " AND DATE(ds.discharge_date) >= ?";
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += " AND DATE(ds.discharge_date) <= ?";
      params.push(filters.end_date);
    }

    query += " ORDER BY ds.discharge_date DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT ds.*, 
             pv.visit_date,
             pv.admission_date_time,
             pv.ward,
             pv.room,
             pv.bed,
             pv.diagnosis as visit_diagnosis,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             p.phone,
             p.gender,
             p.date_of_birth,
             p.address,
             p.blood_group,
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name,
             d.qualification,
             d.specialization,
             dept.name as department_name
      FROM discharge_summaries ds
      LEFT JOIN patient_visits pv ON ds.patient_visit_id = pv.id
      LEFT JOIN patients p ON ds.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      LEFT JOIN departments dept ON pv.department_id = dept.id
      WHERE ds.id = ?
    `,
      [id]
    );
    return rows[0];
  }

  static async create(summaryData) {
    const {
      patient_visit_id,
      patient_id,
      diagnosis,
      treatment,
      procedures,
      operation_details,
      medicines,
      investigations,
      advice,
      follow_up_date,
      doctor_signature,
      discharge_date
    } = summaryData;

    const [result] = await db.execute(
      `INSERT INTO discharge_summaries (patient_visit_id, patient_id, diagnosis, treatment, procedures, operation_details, medicines, investigations, advice, follow_up_date, doctor_signature, discharge_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_visit_id || null,
        patient_id || null,
        diagnosis || null,
        treatment || null,
        procedures || null,
        operation_details || null,
        medicines || null,
        investigations || null,
        advice || null,
        follow_up_date || null,
        doctor_signature || null,
        discharge_date || new Date().toISOString().slice(0, 10)
      ]
    );

    return {
      id: result.insertId,
      ...summaryData
    };
  }

  static async update(id, summaryData) {
    const {
      diagnosis,
      treatment,
      procedures,
      operation_details,
      medicines,
      investigations,
      advice,
      follow_up_date,
      doctor_signature,
      discharge_date
    } = summaryData;

    await db.execute(
      `UPDATE discharge_summaries SET diagnosis = ?, treatment = ?, procedures = ?, operation_details = ?, medicines = ?, investigations = ?, advice = ?, follow_up_date = ?, doctor_signature = ?, discharge_date = ? WHERE id = ?`,
      [
        diagnosis,
        treatment,
        procedures,
        operation_details,
        medicines,
        investigations,
        advice,
        follow_up_date,
        doctor_signature,
        discharge_date,
        id
      ]
    );

    return { id, ...summaryData };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM discharge_summaries WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getByPatientId(patientId) {
    const [rows] = await db.execute(
      `
      SELECT ds.*, 
             pv.visit_date,
             pv.admission_date_time,
             pv.ward,
             pv.room,
             pv.bed,
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name
      FROM discharge_summaries ds
      LEFT JOIN patient_visits pv ON ds.patient_visit_id = pv.id
      LEFT JOIN patients p ON ds.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      WHERE ds.patient_id = ?
      ORDER BY ds.discharge_date DESC
    `,
      [patientId]
    );
    return rows;
  }
}

module.exports = DischargeSummary;
