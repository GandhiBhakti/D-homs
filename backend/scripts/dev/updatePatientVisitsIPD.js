const db = require('./config/database');

async function updatePatientVisitsIPD() {
  try {
    console.log('Updating patient_visits table for IPD admission details...');
    
    const columns = [
      'ALTER TABLE patient_visits ADD COLUMN ward VARCHAR(100) NULL',
      'ALTER TABLE patient_visits ADD COLUMN room VARCHAR(100) NULL',
      'ALTER TABLE patient_visits ADD COLUMN bed VARCHAR(100) NULL',
      'ALTER TABLE patient_visits ADD COLUMN floor VARCHAR(50) NULL',
      'ALTER TABLE patient_visits ADD COLUMN admission_date_time DATETIME NULL'
    ];
    
    for (const column of columns) {
      try {
        await db.execute(column);
        console.log(`Column added successfully`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping...`);
        } else {
          console.error(`Error adding column:`, err);
        }
      }
    }
    
    console.log('\npatient_visits table updated successfully for IPD admission!');
    
  } catch (error) {
    console.error('Error updating patient_visits table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updatePatientVisitsIPD();
