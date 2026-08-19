const db = require("../config/database");

class ABHA {
  /**
   * Create ABHA record for a patient
   */
  static async createABHA(connection, abhaData) {
    const executor = connection || db;
    const [result] = await executor.execute(
      `INSERT INTO patient_abha 
       (patient_id, health_id, health_id_number, name, gender, year_of_birth, 
        day_of_birth, month_of_birth, state, district, mobile, email, address, 
        verification_status, linked_at, access_token, refresh_token)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
      [
        abhaData.patient_id,
        abhaData.health_id,
        abhaData.health_id_number,
        abhaData.name,
        abhaData.gender,
        abhaData.year_of_birth,
        abhaData.day_of_birth,
        abhaData.month_of_birth,
        abhaData.state,
        abhaData.district,
        abhaData.mobile,
        abhaData.email,
        abhaData.address,
        abhaData.verification_status || 'verified',
        abhaData.access_token,
        abhaData.refresh_token
      ]
    );

    return {
      id: result.insertId,
      ...abhaData
    };
  }

  /**
   * Get ABHA by patient ID
   */
  static async getByPatientId(patientId) {
    const [rows] = await db.execute(
      `SELECT * FROM patient_abha WHERE patient_id = ? LIMIT 1`,
      [patientId]
    );
    return rows[0];
  }

  /**
   * Get ABHA by health ID
   */
  static async getByHealthId(healthId) {
    const [rows] = await db.execute(
      `SELECT * FROM patient_abha WHERE health_id = ? LIMIT 1`,
      [healthId]
    );
    return rows[0];
  }

  /**
   * Update ABHA verification status
   */
  static async updateVerificationStatus(abhaId, status) {
    const [result] = await db.execute(
      `UPDATE patient_abha SET verification_status = ? WHERE id = ?`,
      [status, abhaId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Update ABHA tokens
   */
  static async updateTokens(abhaId, accessToken, refreshToken) {
    const [result] = await db.execute(
      `UPDATE patient_abha SET access_token = ?, refresh_token = ? WHERE id = ?`,
      [accessToken, refreshToken, abhaId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete ABHA record
   */
  static async delete(abhaId) {
    const [result] = await db.execute(
      `DELETE FROM patient_abha WHERE id = ?`,
      [abhaId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ABHA;
