const db = require('./config/database');

async function createDischargeSummaryTable() {
  try {
    console.log('Creating discharge_summaries table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS discharge_summaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_visit_id INT NULL,
        patient_id INT NULL,
        diagnosis TEXT NULL,
        treatment TEXT NULL,
        procedures TEXT NULL,
        operation_details TEXT NULL,
        medicines TEXT NULL,
        investigations TEXT NULL,
        advice TEXT NULL,
        follow_up_date DATE NULL,
        doctor_signature VARCHAR(255) NULL,
        discharge_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits(id) ON DELETE SET NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Discharge summaries table created successfully!');
    
  } catch (error) {
    console.error('Error creating discharge summaries table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createDischargeSummaryTable();
