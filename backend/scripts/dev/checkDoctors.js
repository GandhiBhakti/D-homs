const mysql = require('mysql2/promise');

async function checkDoctors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    const [doctors] = await connection.execute('SELECT id, first_name, last_name, email, phone, department_id, specialization, qualification, consultation_fee, is_available FROM doctors ORDER BY id');
    console.log('Doctors in database:');
    doctors.forEach(doc => {
      console.log(`${doc.id}. Dr. ${doc.first_name} ${doc.last_name} - ${doc.qualification} - ${doc.specialization}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkDoctors();
