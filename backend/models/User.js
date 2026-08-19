const bcrypt = require("bcryptjs");
const db = require("../config/database");

const normalizePassword = async (password) => {
  if (!password) return password;
  if (typeof password !== "string") return password;
  if (
    password.startsWith("$2") ||
    password.startsWith("$2a") ||
    password.startsWith("$2b")
  ) {
    return password;
  }
  return bcrypt.hash(password, 10);
};

class User {
  static async findAll() {
    const [rows] = await db.execute("SELECT * FROM users");
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await db.execute("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async create(userData) {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      phone,
      is_active,
    } = userData;
    const hashedPassword = await normalizePassword(password);
    const [result] = await db.execute(
      "INSERT INTO users (username, email, password, first_name, last_name, role, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        username,
        email,
        hashedPassword,
        first_name,
        last_name,
        role,
        phone,
        is_active,
      ],
    );
    return { id: result.insertId, ...userData, password: hashedPassword };
  }

  static async update(id, userData) {
    const {
      username,
      email,
      password,
      first_name,
      last_name,
      role,
      phone,
      is_active,
    } = userData;
    const hashedPassword = await normalizePassword(password);
    await db.execute(
      "UPDATE users SET username = ?, email = ?, password = ?, first_name = ?, last_name = ?, role = ?, phone = ?, is_active = ? WHERE id = ?",
      [
        username,
        email,
        hashedPassword,
        first_name,
        last_name,
        role,
        phone,
        is_active,
        id,
      ],
    );
    return { id, ...userData, password: hashedPassword };
  }

  static async delete(id) {
    const [result] = await db.execute("DELETE FROM users WHERE id = ?", [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
