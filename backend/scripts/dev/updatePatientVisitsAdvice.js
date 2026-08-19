const db = require('./config/database');

async function updatePatientVisitsAdvice() {
  try {
    console.log('Updating patient_visits table for advice section...');
    
    const columns = [
      'ALTER TABLE patient_visits ADD COLUMN admission_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN injection_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN plaster_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN dressing_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN operation_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN physiotherapy_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN pmjay_advice TEXT NULL',
      'ALTER TABLE patient_visits ADD COLUMN non_pmjay_advice TEXT NULL'
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
    
    console.log('\npatient_visits table updated successfully for advice section!');
    
  } catch (error) {
    console.error('Error updating patient_visits table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updatePatientVisitsAdvice();
