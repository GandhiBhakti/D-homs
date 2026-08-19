const db = require("../config/database");

class Patient {
  static async findAll() {
    const [rows] = await db.execute("SELECT * FROM patients ORDER BY created_at DESC");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM patients WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByPatientId(patientId) {
    const [rows] = await db.execute("SELECT * FROM patients WHERE patient_id = ?", [patientId]);
    return rows[0];
  }

  static async create(patientData) {
    const {
      patient_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone,
    } = patientData;
    const [result] = await db.execute(
      "INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        patient_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        address,
        blood_group,
        emergency_contact_name,
        emergency_contact_phone,
      ],
    );
    return { id: result.insertId, ...patientData };
  }

  static async update(id, patientData) {
    const {
      patient_id,
      first_name,
      last_name,
      date_of_birth,
      gender,
      phone,
      email,
      address,
      blood_group,
      emergency_contact_name,
      emergency_contact_phone,
    } = patientData;
    await db.execute(
      "UPDATE patients SET patient_id = ?, first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, phone = ?, email = ?, address = ?, blood_group = ?, emergency_contact_name = ?, emergency_contact_phone = ? WHERE id = ?",
      [
        patient_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        address,
        blood_group,
        emergency_contact_name,
        emergency_contact_phone,
        id,
      ],
    );
    return { id, ...patientData };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM patients WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

module.exports = Patient;
