const db = require('./config/database');

async function checkPatientVisits() {
  try {
    console.log('Checking patient visits in database...\n');
    
    // Check if patients table has data
    const [patients] = await db.execute('SELECT id, patient_id, first_name, last_name, phone FROM patients LIMIT 10');
    console.log('Patients in database:');
    console.log(patients);
    
    // Check if patient_visits table has OPD data
    const [visits] = await db.execute(`
      SELECT pv.id, pv.visit_type, pv.visit_date, pv.status, pv.patient_id,
             p.first_name, p.last_name, p.phone,
             d.name AS department_name,
             dr.first_name AS doctor_first_name, dr.last_name AS doctor_last_name
      FROM patient_visits pv
      LEFT JOIN patients p ON p.id = pv.patient_id
      LEFT JOIN departments d ON d.id = pv.department_id
      LEFT JOIN doctors dr ON dr.id = pv.doctor_id
      WHERE pv.visit_type = 'OPD'
      ORDER BY pv.visit_date DESC
      LIMIT 10
    `);
    console.log('\nOPD Visits in database:');
    console.log(visits);
    
    console.log('\nTotal OPD visits:', visits.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkPatientVisits();
