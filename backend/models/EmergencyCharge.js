const db = require("../config/database");

class EmergencyCharge {
  static async findAll(activeOnly = false) {
    let query = "SELECT * FROM emergency_charges";
    const params = [];
    
    if (activeOnly) {
      query += " WHERE is_active = 1";
    }
    
    query += " ORDER BY charge_name ASC";
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM emergency_charges WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByName(chargeName) {
    const [rows] = await db.execute("SELECT * FROM emergency_charges WHERE charge_name = ?", [chargeName]);
    return rows[0];
  }

  static async create(chargeData) {
    const { charge_name, charge_amount, description, is_active = true } = chargeData;

    const [result] = await db.execute(
      `INSERT INTO emergency_charges (charge_name, charge_amount, description, is_active)
       VALUES (?, ?, ?, ?)`,
      [charge_name, charge_amount, description, is_active ? 1 : 0]
    );

    return {
      id: result.insertId,
      ...chargeData
    };
  }

  static async update(id, chargeData) {
    const { charge_name, charge_amount, description, is_active } = chargeData;

    await db.execute(
      `UPDATE emergency_charges SET charge_name = ?, charge_amount = ?, description = ?, is_active = ? WHERE id = ?`,
      [charge_name, charge_amount, description, is_active ? 1 : 0, id]
    );

    return { id, ...chargeData };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM emergency_charges WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async updateChargeAmount(chargeName, newAmount) {
    await db.execute(
      "UPDATE emergency_charges SET charge_amount = ? WHERE charge_name = ?",
      [newAmount, chargeName]
    );
    
    const [rows] = await db.execute("SELECT * FROM emergency_charges WHERE charge_name = ?", [chargeName]);
    return rows[0];
  }
}

module.exports = EmergencyCharge;
