const db = require("../config/database");

class SystemSettings {
  static async findAll() {
    const [rows] = await db.execute("SELECT * FROM system_settings ORDER BY setting_key ASC");
    return rows;
  }

  static async findByKey(settingKey) {
    const [rows] = await db.execute("SELECT * FROM system_settings WHERE setting_key = ?", [settingKey]);
    return rows[0];
  }

  static async getValue(settingKey) {
    const setting = await this.findByKey(settingKey);
    if (!setting) return null;

    if (setting.setting_type === 'boolean') {
      return setting.setting_value === 'true';
    } else if (setting.setting_type === 'number') {
      return parseFloat(setting.setting_value);
    } else if (setting.setting_type === 'json') {
      try {
        return JSON.parse(setting.setting_value);
      } catch {
        return setting.setting_value;
      }
    }
    return setting.setting_value;
  }

  static async create(settingData) {
    const { setting_key, setting_value, setting_type = 'string', description, is_editable_by_admin = true } = settingData;

    const [result] = await db.execute(
      `INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_editable_by_admin)
       VALUES (?, ?, ?, ?, ?)`,
      [setting_key, setting_value, setting_type, description, is_editable_by_admin ? 1 : 0]
    );

    return {
      id: result.insertId,
      ...settingData
    };
  }

  static async update(settingKey, settingData) {
    const { setting_value, setting_type, description, is_editable_by_admin } = settingData;

    await db.execute(
      `UPDATE system_settings SET setting_value = ?, setting_type = ?, description = ?, is_editable_by_admin = ? WHERE setting_key = ?`,
      [setting_value, setting_type, description, is_editable_by_admin ? 1 : 0, settingKey]
    );

    return { setting_key: settingKey, ...settingData };
  }

  static async delete(settingKey) {
    const [result] = await db.execute("DELETE FROM system_settings WHERE setting_key = ?", [settingKey]);
    return result.affectedRows > 0;
  }

  static async getAdvancePaymentSettings() {
    const mandatory = await this.getValue('mandatory_advance_for_ipd');
    const minimumAmount = await this.getValue('minimum_advance_amount') || 0;
    
    return {
      mandatory: mandatory === true,
      minimumAmount: minimumAmount
    };
  }
}

module.exports = SystemSettings;
