const db = require("../config/database");

class DoctorCommission {
  static async findAll(filters = {}) {
    let query = `
      SELECT dc.*, 
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name,
             d.specialization
      FROM doctor_commission dc
      LEFT JOIN doctors d ON dc.doctor_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.doctor_id) {
      query += " AND dc.doctor_id = ?";
      params.push(filters.doctor_id);
    }
    if (filters.is_active !== undefined) {
      query += " AND dc.is_active = ?";
      params.push(filters.is_active ? 1 : 0);
    }

    query += " ORDER BY dc.created_at DESC";

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
      SELECT dc.*, 
             d.first_name as doctor_first_name,
             d.last_name as doctor_last_name,
             d.specialization
      FROM doctor_commission dc
      LEFT JOIN doctors d ON dc.doctor_id = d.id
      WHERE dc.id = ?
    `,
      [id]
    );
    return rows[0];
  }

  static async findByDoctorId(doctorId) {
    const [rows] = await db.execute(
      "SELECT * FROM doctor_commission WHERE doctor_id = ? AND is_active = 1",
      [doctorId]
    );
    return rows[0];
  }

  static async create(commissionData) {
    const {
      doctor_id,
      opd_commission_type = 'percentage',
      opd_commission_value = 0,
      opd_custom_formula = null,
      ipd_commission_type = 'percentage',
      ipd_commission_value = 0,
      ipd_custom_formula = null,
      ot_commission_type = 'percentage',
      ot_commission_value = 0,
      ot_custom_formula = null,
      cost_deduction = false,
      cost_deduction_amount = 0,
      is_active = true
    } = commissionData;

    const [result] = await db.execute(
      `INSERT INTO doctor_commission (doctor_id, opd_commission_type, opd_commission_value, opd_custom_formula, ipd_commission_type, ipd_commission_value, ipd_custom_formula, ot_commission_type, ot_commission_value, ot_custom_formula, cost_deduction, cost_deduction_amount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doctor_id,
        opd_commission_type,
        opd_commission_value,
        opd_custom_formula,
        ipd_commission_type,
        ipd_commission_value,
        ipd_custom_formula,
        ot_commission_type,
        ot_commission_value,
        ot_custom_formula,
        cost_deduction ? 1 : 0,
        cost_deduction_amount,
        is_active ? 1 : 0
      ]
    );

    return {
      id: result.insertId,
      ...commissionData
    };
  }

  static async update(id, commissionData) {
    const {
      opd_commission_type,
      opd_commission_value,
      opd_custom_formula,
      ipd_commission_type,
      ipd_commission_value,
      ipd_custom_formula,
      ot_commission_type,
      ot_commission_value,
      ot_custom_formula,
      cost_deduction,
      cost_deduction_amount,
      is_active
    } = commissionData;

    await db.execute(
      `UPDATE doctor_commission SET opd_commission_type = ?, opd_commission_value = ?, opd_custom_formula = ?, ipd_commission_type = ?, ipd_commission_value = ?, ipd_custom_formula = ?, ot_commission_type = ?, ot_commission_value = ?, ot_custom_formula = ?, cost_deduction = ?, cost_deduction_amount = ?, is_active = ? WHERE id = ?`,
      [
        opd_commission_type,
        opd_commission_value,
        opd_custom_formula,
        ipd_commission_type,
        ipd_commission_value,
        ipd_custom_formula,
        ot_commission_type,
        ot_commission_value,
        ot_custom_formula,
        cost_deduction ? 1 : 0,
        cost_deduction_amount,
        is_active ? 1 : 0,
        id
      ]
    );

    return { id, ...commissionData };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM doctor_commission WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }

  static async calculateCommission(doctorId, amount, type = 'opd', cost = 0) {
    const commission = await this.findByDoctorId(doctorId);
    
    if (!commission) {
      return 0;
    }

    let commissionAmount = 0;
    let commissionType, commissionValue, customFormula;

    if (type === 'opd') {
      commissionType = commission.opd_commission_type;
      commissionValue = commission.opd_commission_value;
      customFormula = commission.opd_custom_formula;
    } else if (type === 'ipd') {
      commissionType = commission.ipd_commission_type;
      commissionValue = commission.ipd_commission_value;
      customFormula = commission.ipd_custom_formula;
    } else if (type === 'ot') {
      commissionType = commission.ot_commission_type;
      commissionValue = commission.ot_commission_value;
      customFormula = commission.ot_custom_formula;
    }

    // Apply cost deduction if enabled
    let baseAmount = amount;
    if (commission.cost_deduction && cost > 0) {
      baseAmount = amount - cost;
      if (baseAmount < 0) baseAmount = 0;
    }

    if (commissionType === 'percentage') {
      commissionAmount = (baseAmount * commissionValue) / 100;
    } else if (commissionType === 'fixed') {
      commissionAmount = commissionValue;
    } else if (commissionType === 'custom' && customFormula) {
      // Simple custom formula evaluation
      // Formula examples: "60% Doctor / 40% Hospital" -> 60% of amount
      try {
        const percentageMatch = customFormula.match(/(\d+)%/);
        if (percentageMatch) {
          const percentage = parseFloat(percentageMatch[1]);
          commissionAmount = (baseAmount * percentage) / 100;
        }
      } catch (error) {
        console.error('Error evaluating custom formula:', error);
        commissionAmount = 0;
      }
    }

    return parseFloat(commissionAmount.toFixed(2));
  }
}

module.exports = DoctorCommission;
