const mysql = require('mysql2/promise');

async function addDoctors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Adding doctors...');
    
    // Add the 5 doctors
    await connection.execute(`
      INSERT INTO doctors (first_name, last_name, email, phone, department_id, specialization, qualification, consultation_fee, is_available) VALUES
      ('Devansheeba Jadeja', 'Sodha', 'devansheeba@hospital.com', '9876543220', 4, 'Radiologist & Fetal Medicine', 'MD (Radio Diagnosis), CCFRG', 1500, 1),
      ('Bharat', 'Kalsariya', 'bharat@hospital.com', '9876543221', 13, 'General & Laparoscopic Surgeon', 'MS (General Surgery)', 1200, 1),
      ('Rajveersinh', 'Sodha', 'rajveersinh@hospital.com', '9876543222', 9, 'Orthopedic & Joint Replacement Surgeon', 'MS (Ortho), FIJR, FISS, FIAS', 1800, 1),
      ('Upasna', 'Dhuliya', 'upasna@hospital.com', '9876543223', 1, 'Medicine Consultant - Physician', 'MD', 800, 1),
      ('Bhavesh', 'Khandhar', 'bhavesh@hospital.com', '9876543224', 6, 'Paediatric', 'M.D', 1000, 1)
    `);
    
    console.log('Doctors added successfully!');
  } catch (error) {
    console.error('Error adding doctors:', error.message);
  } finally {
    await connection.end();
  }
}

addDoctors();
