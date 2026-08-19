const db = require('./config/database');

async function alterPrescriptionTable() {
  try {
    console.log('Altering prescriptions table to allow null patient_id...');
    
    await db.execute(`
      ALTER TABLE prescriptions MODIFY COLUMN patient_id INT NULL
    `);
    
    console.log('Prescriptions table altered successfully!');
    
  } catch (error) {
    console.error('Error altering prescriptions table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

alterPrescriptionTable();
