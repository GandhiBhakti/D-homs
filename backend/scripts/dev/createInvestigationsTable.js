const db = require('./config/database');

async function createInvestigationsTable() {
  try {
    console.log('Creating investigations table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS investigations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_visit_id INT NULL,
        patient_id INT NULL,
        investigation_type ENUM('Laboratory', 'X-Ray', 'USG', 'ECG', '2D Echo', 'CT Scan', 'MRI', 'Other') NOT NULL,
        investigation_name VARCHAR(255) NOT NULL,
        number_of_xrays INT DEFAULT 1,
        notes TEXT NULL,
        status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits(id) ON DELETE SET NULL,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
      )
    `);
    
    console.log('Investigations table created successfully!');
    
  } catch (error) {
    console.error('Error creating investigations table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createInvestigationsTable();
