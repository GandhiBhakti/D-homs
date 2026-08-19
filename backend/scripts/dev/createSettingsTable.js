const db = require('./config/database');

async function createSettingsTable() {
  try {
    console.log('Creating system_settings table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT NULL,
        setting_type ENUM("boolean", "number", "string", "json") DEFAULT "string",
        description TEXT NULL,
        is_editable_by_admin TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('System settings table created successfully!');
    
    // Insert default settings
    console.log('Inserting default system settings...');
    const defaultSettings = [
      { setting_key: 'mandatory_advance_for_ipd', setting_value: 'true', setting_type: 'boolean', description: 'Require advance payment before IPD admission' },
      { setting_key: 'minimum_advance_amount', setting_value: '5000', setting_type: 'number', description: 'Minimum advance amount required for IPD admission' },
      { setting_key: 'hospital_name', setting_value: 'Divine Hospital', setting_type: 'string', description: 'Hospital name for printouts and reports' },
      { setting_key: 'hospital_tagline', setting_value: 'Speciality Hospital', setting_type: 'string', description: 'Hospital tagline for printouts' },
      { setting_key: 'hospital_address', setting_value: '123 Medical Complex, Healthcare Road', setting_type: 'string', description: 'Hospital address for printouts' },
      { setting_key: 'hospital_phone', setting_value: '+91 98765 43210', setting_type: 'string', description: 'Hospital contact number' },
      { setting_key: 'hospital_email', setting_value: 'info@divinehospital.com', setting_type: 'string', description: 'Hospital email address' },
      { setting_key: 'enable_sms_notifications', setting_value: 'false', setting_type: 'boolean', description: 'Enable SMS notifications for follow-ups' },
      { setting_key: 'enable_whatsapp_notifications', setting_value: 'false', setting_type: 'boolean', description: 'Enable WhatsApp notifications for follow-ups' }
    ];
    
    for (const setting of defaultSettings) {
      try {
        await db.execute(
          `INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)`,
          [setting.setting_key, setting.setting_value, setting.setting_type, setting.description]
        );
        console.log(`Inserted: ${setting.setting_key}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Setting already exists: ${setting.setting_key}, skipping...`);
        } else {
          console.error(`Error inserting setting:`, err);
        }
      }
    }
    
    console.log('\nDefault system settings inserted successfully!');
    
  } catch (error) {
    console.error('Error creating system settings table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createSettingsTable();
