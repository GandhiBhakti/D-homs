const db = require('./config/database');

async function updatePatientVisitsTable() {
  try {
    console.log('Updating patient_visits table structure...');
    
    const columns = [
      'ALTER TABLE patient_visits ADD COLUMN uhid VARCHAR(50) NULL',
      'ALTER TABLE patient_visits ADD COLUMN age INT NULL',
      'ALTER TABLE patient_visits ADD COLUMN relative_name VARCHAR(100) NULL',
      'ALTER TABLE patient_visits ADD COLUMN relative_mobile VARCHAR(20) NULL',
      'ALTER TABLE patient_visits ADD COLUMN reference_doctor_id INT NULL',
      'ALTER TABLE patient_visits ADD COLUMN is_pmjay TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN is_plastic_surgery TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN admission_advice TINYINT(1) DEFAULT 0',
      'ALTER TABLE patient_visits ADD COLUMN follow_up_date DATE NULL'
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
    
    console.log('\npatient_visits table updated successfully!');
    
  } catch (error) {
    console.error('Error updating patient_visits table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updatePatientVisitsTable();
