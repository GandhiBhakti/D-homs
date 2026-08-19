const db = require('./config/database');

async function testOPDAPI() {
  try {
    console.log('Testing OPD API query...\n');
    
    // Run the exact query from the controller
    let query = `
      SELECT pv.id, pv.visit_date, pv.status, pv.chief_complaints, pv.diagnosis, pv.notes,
             p.first_name, p.last_name, p.phone, p.email,
             d.name AS department_name,
             dr.first_name AS doctor_first_name, dr.last_name AS doctor_last_name, dr.id AS doctor_id
      FROM patient_visits pv
      LEFT JOIN patients p ON p.id = pv.patient_id
      LEFT JOIN departments d ON d.id = pv.department_id
      LEFT JOIN doctors dr ON dr.id = pv.doctor_id
      WHERE pv.visit_type = 'OPD'
      ORDER BY pv.visit_date DESC, pv.id DESC
    `;
    
    const [rows] = await db.execute(query);
    
    console.log('Query returned', rows.length, 'rows');
    console.log('\nFirst 3 rows:');
    console.log(JSON.stringify(rows.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

testOPDAPI();
