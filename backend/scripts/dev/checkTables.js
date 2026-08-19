const mysql = require('mysql2/promise');

async function checkTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    const [rows] = await connection.execute('SHOW TABLES');
    console.log('Tables in hospital_management:');
    rows.forEach(row => {
      console.log(Object.values(row)[0]);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkTables();
