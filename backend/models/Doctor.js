const db = require("../config/database");

class Doctor {
  static normalizeDoctorPayload(doctorData = {}) {
    const normalized = { ...doctorData };

    const trimIfString = (value) =>
      typeof value === "string" ? value.trim() : value;
    const toNullable = (value) => {
      if (value === undefined || value === null) return null;
      if (typeof value === "string" && value.trim() === "") return null;
      return value;
    };

    const fields = [
      "user_id",
      "department_id",
      "designation_id",
      "experience_years",
      "consultation_fee",
      "visit_charges",
    ];

    fields.forEach((field) => {
      const value = normalized[field];
      if (value === "" || value === undefined || value === null) {
        normalized[field] = null;
      } else if (typeof value === "string" && value.trim() === "") {
        normalized[field] = null;
      }
    });

    if (
      normalized.experience_years !== null &&
      normalized.experience_years !== undefined
    ) {
      normalized.experience_years = Number(normalized.experience_years);
    }

    if (
      normalized.consultation_fee !== null &&
      normalized.consultation_fee !== undefined
    ) {
      normalized.consultation_fee = Number(normalized.consultation_fee);
    }

    if (
      normalized.visit_charges !== null &&
      normalized.visit_charges !== undefined
    ) {
      normalized.visit_charges = Number(normalized.visit_charges);
    }

    if (
      normalized.is_available === undefined ||
      normalized.is_available === null
    ) {
      normalized.is_available = true;
    } else if (typeof normalized.is_available === "string") {
      const lower = normalized.is_available.toLowerCase();
      normalized.is_available =
        lower === "true" || lower === "1" || lower === "yes";
    }

    if (
      normalized.is_active === undefined ||
      normalized.is_active === null
    ) {
      normalized.is_active = true;
    } else if (typeof normalized.is_active === "string") {
      const lower = normalized.is_active.toLowerCase();
      normalized.is_active =
        lower === "true" || lower === "1" || lower === "yes";
    }

    normalized.first_name = trimIfString(normalized.first_name);
    normalized.last_name = trimIfString(normalized.last_name);
    normalized.email = trimIfString(normalized.email);
    normalized.phone = trimIfString(normalized.phone);
    normalized.specialization = trimIfString(normalized.specialization);
    normalized.qualification = trimIfString(normalized.qualification);

    return normalized;
  }

  static async findAll() {
    const [rows] = await db.execute(`
            SELECT d.*, 
                   dept.name as department_name, 
                   des.title as designation_title 
            FROM doctors d 
            LEFT JOIN departments dept ON d.department_id = dept.id 
            LEFT JOIN designations des ON d.designation_id = des.id
        `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `
            SELECT d.*, 
                   dept.name as department_name, 
                   des.title as designation_title 
            FROM doctors d 
            LEFT JOIN departments dept ON d.department_id = dept.id 
            LEFT JOIN designations des ON d.designation_id = des.id 
            WHERE d.id = ?
        `,
      [id],
    );
    return rows[0];
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `
            SELECT d.*, 
                   dept.name as department_name, 
                   des.title as designation_title 
            FROM doctors d 
            LEFT JOIN departments dept ON d.department_id = dept.id 
            LEFT JOIN designations des ON d.designation_id = des.id 
            WHERE d.user_id = ?
        `,
      [userId],
    );
    return rows[0];
  }

  static async create(doctorData) {
    const normalized = this.normalizeDoctorPayload(doctorData);
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      mobile,
      department_id,
      designation_id,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      visit_charges,
      opd_commission,
      ipd_commission,
      ot_commission,
      is_available,
      is_active,
    } = normalized;

    if (!first_name || !last_name || !email) {
      throw new Error("First name, last name, and email are required");
    }

    const [result] = await db.execute(
      "INSERT INTO doctors (user_id, first_name, last_name, email, phone, mobile, department_id, designation_id, specialization, qualification, experience_years, consultation_fee, visit_charges, opd_commission, ipd_commission, ot_commission, is_available, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        department_id,
        designation_id,
        specialization,
        qualification,
        experience_years,
        consultation_fee,
        visit_charges,
        opd_commission,
        ipd_commission,
        ot_commission,
        is_available,
        is_active,
      ],
    );
    return { id: result.insertId, ...normalized };
  }

  static async update(id, doctorData) {
    const normalized = this.normalizeDoctorPayload(doctorData);
    const {
      user_id,
      first_name,
      last_name,
      email,
      phone,
      mobile,
      department_id,
      designation_id,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      visit_charges,
      opd_commission,
      ipd_commission,
      ot_commission,
      is_available,
      is_active,
    } = normalized;

    if (!first_name || !last_name || !email) {
      throw new Error("First name, last name, and email are required");
    }

    await db.execute(
      "UPDATE doctors SET user_id = ?, first_name = ?, last_name = ?, email = ?, phone = ?, mobile = ?, department_id = ?, designation_id = ?, specialization = ?, qualification = ?, experience_years = ?, consultation_fee = ?, visit_charges = ?, opd_commission = ?, ipd_commission = ?, ot_commission = ?, is_available = ?, is_active = ? WHERE id = ?",
      [
        user_id,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        department_id,
        designation_id,
        specialization,
        qualification,
        experience_years,
        consultation_fee,
        visit_charges,
        opd_commission,
        ipd_commission,
        ot_commission,
        is_available,
        is_active,
        id,
      ],
    );
    return { id, ...normalized };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM doctors WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Doctor;
