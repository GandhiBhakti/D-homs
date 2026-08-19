const mysql = require('mysql2/promise');

async function updateAllUsernames() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Updating all users to have username = email...');
    
    // Update all doctors: username = email, password = 12345678
    const [doctorResult] = await connection.execute(
      "UPDATE users SET username = email, password = '12345678' WHERE role = 'doctor'"
    );
    console.log(`Updated ${doctorResult.affectedRows} doctor accounts`);
    
    // Update all receptionists: username = email, password = 123456789
    const [receptionistResult] = await connection.execute(
      "UPDATE users SET username = email, password = '123456789' WHERE role = 'receptionist'"
    );
    console.log(`Updated ${receptionistResult.affectedRows} receptionist accounts`);
    
    // Verify the update
    const [users] = await connection.execute(
      "SELECT username, email, role, password FROM users WHERE role IN ('doctor', 'receptionist') LIMIT 10"
    );
    console.log('\nUpdated user credentials:');
    users.forEach(user => {
      console.log(`  ${user.role}: ${user.username} - password: ${user.password}`);
    });
    
    console.log('\nAll usernames and passwords updated successfully!');
  } catch (error) {
    console.error('Error updating usernames:', error);
  } finally {
    await connection.end();
  }
}

updateAllUsernames();
