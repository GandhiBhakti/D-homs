const db = require('./config/database');

async function addSampleIPD() {
  try {
    console.log('Adding sample IPD admissions...');
    
    // Get existing patient IDs
    const [patients] = await db.execute('SELECT id, first_name, last_name FROM patients LIMIT 5');
    
    // Get doctor IDs
    const [doctors] = await db.execute('SELECT id, first_name FROM doctors ORDER BY id LIMIT 6');
    
    // Get department IDs
    const [departments] = await db.execute('SELECT id, name FROM departments ORDER BY id LIMIT 6');
    
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const doctor = doctors[i % doctors.length];
      const department = departments[i % departments.length];
      
      try {
        await db.execute(
          `INSERT INTO patient_visits (patient_id, visit_type, visit_date, admission_date, department_id, doctor_id, status, chief_complaints, diagnosis) 
           VALUES (?, 'IPD', ?, ?, ?, ?, 'active', ?, ?)`,
          [patient.id, today, today, department.id, doctor.id, 'Severe pain', 'Under investigation']
        );
        console.log(`Inserted IPD admission for ${patient.first_name} ${patient.last_name}`);
      } catch (err) {
        console.log(`IPD admission already exists for patient ${patient.first_name}`);
      }
    }
    
    console.log('\nSample IPD admissions added successfully!');
  } catch (error) {
    console.error('Error adding sample IPD data:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

addSampleIPD();
