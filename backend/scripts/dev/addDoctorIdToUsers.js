const db = require('./config/database');

async function addDoctorIdToUsers() {
  try {
    console.log('Adding doctor_id column to users table...');
    
    await db.execute(`
      ALTER TABLE users ADD COLUMN doctor_id INT NULL
    `);
    
    console.log('doctor_id column added successfully!');
    
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column doctor_id already exists in users table');
    } else {
      console.error('Error adding doctor_id column:', error);
    }
  } finally {
    await db.end();
    process.exit(0);
  }
}

addDoctorIdToUsers();
