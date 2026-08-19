const mysql = require('mysql2/promise');

async function createPmjayClaimsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Creating PMJAY claims table...');

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS pmjay_claims (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_id INT,
        card_number VARCHAR(50) NOT NULL,
        package_code VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        claim_id VARCHAR(100),
        status ENUM('submitted', 'pending', 'approved', 'rejected', 'processed') DEFAULT 'submitted',
        submitted_at DATETIME,
        updated_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL,
        INDEX idx_card_number (card_number),
        INDEX idx_claim_id (claim_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('PMJAY claims table created successfully!');
  } catch (error) {
    console.error('Error creating PMJAY claims table:', error);
  } finally {
    await connection.end();
  }
}

createPmjayClaimsTable();
