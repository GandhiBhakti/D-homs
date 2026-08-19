const mysql = require('mysql2/promise');

async function checkDepartments() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    const [departments] = await connection.execute('SELECT id, name FROM departments ORDER BY id');
    console.log('Current departments in database:');
    departments.forEach(dept => {
      console.log(`${dept.id}. ${dept.name}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkDepartments();
