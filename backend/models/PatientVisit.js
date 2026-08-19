const db = require("../config/database");

class PatientVisit {
  static async findPatientByEmailOrPhone(connection, email, phone) {
    const executor = connection || db;
    const [rows] = await executor.execute(
      "SELECT * FROM patients WHERE email = ? OR phone = ? LIMIT 1",
      [email || "", phone || ""],
    );
    return rows[0];
  }

  static async createPatient(connection, patientData) {
    const executor = connection || db;
    
    // Get the next patient ID number
    const [countResult] = await executor.execute(
      'SELECT COUNT(*) as count FROM patients'
    );
    const nextNumber = (countResult[0].count || 0) + 1;
    const patientId = patientData.patient_id || `OPD-${String(nextNumber).padStart(4, '0')}`;

    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      blood_group,
    } = patientData;

    const [result] = await executor.execute(
      `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, blood_group)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patientId,
        first_name,
        last_name,
        date_of_birth || null,
        gender || null,
        phone || null,
        email || null,
        address || null,
        blood_group || null,
      ],
    );

    return {
      id: result.insertId,
      patient_id: patientId,
      ...patientData,
    };
  }

  static async createVisit(connection, visitData) {
    const executor = connection || db;
    const visitDate = visitData.visit_date
      ? new Date(visitData.visit_date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10);
    const admissionDateTime = visitData.admission_date_time 
      ? new Date(visitData.admission_date_time).toISOString().slice(0, 19).replace('T', ' ')
      : null;
    const [result] = await executor.execute(
      `INSERT INTO patient_visits (patient_id, visit_type, visit_date, department_id, doctor_id, status, chief_complaints, diagnosis, notes, uhid, age, relative_name, relative_mobile, reference_doctor_id, is_pmjay, is_plastic_surgery, admission_advice, follow_up_date, injection_advice, plaster_advice, dressing_advice, operation_advice, physiotherapy_advice, pmjay_advice, non_pmjay_advice, ward, room, bed, floor, admission_date_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        visitData.patient_id,
        visitData.visit_type || "OPD",
        visitDate,
        visitData.department_id || null,
        visitData.doctor_id || null,
        visitData.status || "active",
        visitData.chief_complaints || null,
        visitData.diagnosis || null,
        visitData.notes || null,
        visitData.uhid || null,
        visitData.age || null,
        visitData.relative_name || null,
        visitData.relative_mobile || null,
        visitData.reference_doctor_id || null,
        visitData.is_pmjay ? 1 : 0,
        visitData.is_plastic_surgery ? 1 : 0,
        visitData.admission_advice ? 1 : 0,
        visitData.follow_up_date || null,
        visitData.injection_advice ? 1 : 0,
        visitData.plaster_advice ? 1 : 0,
        visitData.dressing_advice ? 1 : 0,
        visitData.operation_advice ? 1 : 0,
        visitData.physiotherapy_advice ? 1 : 0,
        visitData.pmjay_advice || null,
        visitData.non_pmjay_advice || null,
        visitData.ward || null,
        visitData.room || null,
        visitData.bed || null,
        visitData.floor || null,
        admissionDateTime,
      ],
    );

    return {
      id: result.insertId,
      ...visitData,
      visit_date: visitDate,
    };
  }
}

module.exports = PatientVisit;
