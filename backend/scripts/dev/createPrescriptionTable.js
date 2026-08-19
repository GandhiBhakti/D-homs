const db = require('./config/database');

async function createPrescriptionTable() {
  try {
    console.log('Creating prescriptions table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS prescriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        doctor_id INT NOT NULL,
        visit_type ENUM('OPD', 'IPD') NOT NULL,
        visit_id INT,
        chief_complaint TEXT,
        diagnosis TEXT,
        prescription_details TEXT,
        lab_tests TEXT,
        xray_tests TEXT,
        other_tests TEXT,
        notes TEXT,
        follow_up_date DATE,
        total_amount DECIMAL(10, 2) DEFAULT 0,
        consultation_fee DECIMAL(10, 2) DEFAULT 0,
        lab_fee DECIMAL(10, 2) DEFAULT 0,
        xray_fee DECIMAL(10, 2) DEFAULT 0,
        other_fee DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
      )
    `);
    
    console.log('Prescriptions table created successfully!');
    
  } catch (error) {
    console.error('Error creating prescriptions table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createPrescriptionTable();
