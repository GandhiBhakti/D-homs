const db = require('./config/database');

async function createEmergencyChargesTable() {
  try {
    console.log('Creating emergency_charges table...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS emergency_charges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        charge_name VARCHAR(255) NOT NULL UNIQUE,
        charge_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
        description TEXT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Emergency charges table created successfully!');
    
    // Insert default emergency charges
    console.log('Inserting default emergency charges...');
    const defaultCharges = [
      { charge_name: 'Emergency Charge', charge_amount: 500, description: 'Standard emergency consultation fee' },
      { charge_name: 'Specialist Doctor', charge_amount: 1500, description: 'Specialist doctor consultation' },
      { charge_name: 'Super Specialist', charge_amount: 2500, description: 'Super specialist doctor consultation' },
      { charge_name: 'X-Ray', charge_amount: 500, description: 'X-Ray investigation' },
      { charge_name: 'ECG', charge_amount: 500, description: 'ECG investigation' },
      { charge_name: 'Injection', charge_amount: 30, description: 'Standard injection fee' },
      { charge_name: 'Plaster', charge_amount: 1000, description: 'Plaster application' },
      { charge_name: 'CLW Closure', charge_amount: 0, description: 'CLW Closure - variable charge' },
      { charge_name: 'Other Charges', charge_amount: 0, description: 'User defined charges' }
    ];
    
    for (const charge of defaultCharges) {
      try {
        await db.execute(
          `INSERT INTO emergency_charges (charge_name, charge_amount, description) VALUES (?, ?, ?)`,
          [charge.charge_name, charge.charge_amount, charge.description]
        );
        console.log(`Inserted: ${charge.charge_name} - ₹${charge.charge_amount}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Charge already exists: ${charge.charge_name}, skipping...`);
        } else {
          console.error(`Error inserting charge:`, err);
        }
      }
    }
    
    console.log('\nDefault emergency charges inserted successfully!');
    
  } catch (error) {
    console.error('Error creating emergency charges table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

createEmergencyChargesTable();
