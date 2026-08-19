const mysql = require('mysql2/promise');

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Checking user accounts...');
    
    const [users] = await connection.execute(
      "SELECT id, username, email, role, password, is_active FROM users WHERE role IN ('doctor', 'receptionist', 'admin') LIMIT 15"
    );
    
    console.log('\nUser accounts:');
    users.forEach(user => {
      console.log(`  ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Active: ${user.is_active}`);
      console.log('  ---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkUsers();
