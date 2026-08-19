const db = require("../config/database");

class Billing {
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, 
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             pv.visit_type,
             pv.visit_date
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.patient_id) {
      query += " AND b.patient_id = ?";
      params.push(filters.patient_id);
    }
    if (filters.patient_visit_id) {
      query += " AND b.patient_visit_id = ?";
      params.push(filters.patient_visit_id);
    }
    if (filters.payment_mode) {
      query += " AND b.payment_mode = ?";
      params.push(filters.payment_mode);
    }
    if (filters.start_date) {
      query += " AND DATE(b.created_at) >= ?";
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += " AND DATE(b.created_at) <= ?";
      params.push(filters.end_date);
    }

    query += " ORDER BY b.created_at DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT b.*, 
             p.first_name as patient_first_name,
             p.last_name as patient_last_name,
             pv.visit_type,
             pv.visit_date
      FROM billing b
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      WHERE b.id = ?
    `,
      [id]
    );
    return rows[0];
  }

  static async create(billingData) {
    const {
      patient_id,
      patient_visit_id,
      total_amount,
      registration_charge = 0,
      consultation_charge = 0,
      specialist_charge = 0,
      emergency_charge = 0,
      xray_charge = 0,
      ecg_charge = 0,
      injection_charge = 0,
      plaster_charge = 0,
      other_charge = 0,
      payment_mode = 'Cash',
      transaction_id,
      status = 'pending',
      room_charge = 0,
      bed_charge = 0,
      doctor_visit_charge = 0,
      surgeon_charge = 0,
      ot_charge = 0,
      implant_charge = 0,
      biomedical_charge = 0,
      rmo_charge = 0,
      medicines_charge = 0,
      lab_charge = 0,
      anesthesia_charge = 0,
      blood_charge = 0,
      other_charge_1 = 0,
      other_charge_2 = 0,
      other_charge_3 = 0,
      advance_amount = 0,
      refund_amount = 0,
      refund_type
    } = billingData;

    const [result] = await db.execute(
      `INSERT INTO billing (patient_id, patient_visit_id, total_amount, registration_charge, consultation_charge, specialist_charge, emergency_charge, xray_charge, ecg_charge, injection_charge, plaster_charge, other_charge, payment_mode, transaction_id, status, room_charge, bed_charge, doctor_visit_charge, surgeon_charge, ot_charge, implant_charge, biomedical_charge, rmo_charge, medicines_charge, lab_charge, anesthesia_charge, blood_charge, other_charge_1, other_charge_2, other_charge_3, advance_amount, refund_amount, refund_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id || null,
        patient_visit_id || null,
        total_amount,
        registration_charge,
        consultation_charge,
        specialist_charge,
        emergency_charge,
        xray_charge,
        ecg_charge,
        injection_charge,
        plaster_charge,
        other_charge,
        payment_mode,
        transaction_id || null,
        status,
        room_charge,
        bed_charge,
        doctor_visit_charge,
        surgeon_charge,
        ot_charge,
        implant_charge,
        biomedical_charge,
        rmo_charge,
        medicines_charge,
        lab_charge,
        anesthesia_charge,
        blood_charge,
        other_charge_1,
        other_charge_2,
        other_charge_3,
        advance_amount,
        refund_amount,
        refund_type
      ]
    );

    return {
      id: result.insertId,
      ...billingData
    };
  }

  static async update(id, billingData) {
    const {
      total_amount,
      registration_charge,
      consultation_charge,
      specialist_charge,
      emergency_charge,
      xray_charge,
      ecg_charge,
      injection_charge,
      plaster_charge,
      other_charge,
      payment_mode,
      transaction_id,
      status,
      room_charge,
      bed_charge,
      doctor_visit_charge,
      surgeon_charge,
      ot_charge,
      implant_charge,
      biomedical_charge,
      rmo_charge,
      medicines_charge,
      lab_charge,
      anesthesia_charge,
      blood_charge,
      other_charge_1,
      other_charge_2,
      other_charge_3,
      advance_amount,
      refund_amount,
      refund_type
    } = billingData;

    await db.execute(
      `UPDATE billing SET total_amount = ?, registration_charge = ?, consultation_charge = ?, specialist_charge = ?, emergency_charge = ?, xray_charge = ?, ecg_charge = ?, injection_charge = ?, plaster_charge = ?, other_charge = ?, payment_mode = ?, transaction_id = ?, status = ?, room_charge = ?, bed_charge = ?, doctor_visit_charge = ?, surgeon_charge = ?, ot_charge = ?, implant_charge = ?, biomedical_charge = ?, rmo_charge = ?, medicines_charge = ?, lab_charge = ?, anesthesia_charge = ?, blood_charge = ?, other_charge_1 = ?, other_charge_2 = ?, other_charge_3 = ?, advance_amount = ?, refund_amount = ?, refund_type = ? WHERE id = ?`,
      [
        total_amount,
        registration_charge,
        consultation_charge,
        specialist_charge,
        emergency_charge,
        xray_charge,
        ecg_charge,
        injection_charge,
        plaster_charge,
        other_charge,
        payment_mode,
        transaction_id,
        status,
        room_charge,
        bed_charge,
        doctor_visit_charge,
        surgeon_charge,
        ot_charge,
        implant_charge,
        biomedical_charge,
        rmo_charge,
        medicines_charge,
        lab_charge,
        anesthesia_charge,
        blood_charge,
        other_charge_1,
        other_charge_2,
        other_charge_3,
        advance_amount,
        refund_amount,
        refund_type,
        id
      ]
    );

    return { id, ...billingData };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM billing WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async getByDateRange(startDate, endDate) {
    const [rows] = await db.execute(
      `
      SELECT DATE(created_at) as date, payment_mode, SUM(total_amount) as total
      FROM billing
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY DATE(created_at), payment_mode
      ORDER BY date DESC
    `,
      [startDate, endDate]
    );
    return rows;
  }

  static async getTotalByPaymentMode(startDate, endDate) {
    const [rows] = await db.execute(
      `
      SELECT payment_mode, SUM(total_amount) as total, COUNT(*) as count
      FROM billing
      WHERE DATE(created_at) BETWEEN ? AND ?
      GROUP BY payment_mode
    `,
      [startDate, endDate]
    );
    return rows;
  }
}

module.exports = Billing;
