const mysql = require('mysql2/promise');

async function updatePasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Updating passwords for doctors and receptionists...');
    
    // Update passwords to plain text for doctors
    const [doctorResult] = await connection.execute(
      "UPDATE users SET password = '12345678' WHERE role = 'doctor'"
    );
    console.log(`Updated ${doctorResult.affectedRows} doctor accounts`);
    
    // Update passwords to plain text for receptionists
    const [receptionistResult] = await connection.execute(
      "UPDATE users SET password = '12345678' WHERE role = 'receptionist'"
    );
    console.log(`Updated ${receptionistResult.affectedRows} receptionist accounts`);
    
    // Verify the update
    const [users] = await connection.execute(
      "SELECT username, email, role, password FROM users WHERE role IN ('doctor', 'receptionist')"
    );
    console.log('\nCurrent user credentials:');
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.username} / ${user.email} - password: ${user.password}`);
    });
    
    console.log('\nPasswords updated successfully!');
  } catch (error) {
    console.error('Error updating passwords:', error);
  } finally {
    await connection.end();
  }
}

updatePasswords();
