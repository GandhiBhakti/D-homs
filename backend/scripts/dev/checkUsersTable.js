const db = require('./config/database');

async function checkUsersTable() {
  try {
    console.log('Checking users table structure...');
    
    const [rows] = await db.execute('DESCRIBE users');
    console.log('Users table columns:');
    rows.forEach(row => {
      console.log(`  ${row.Field} - ${row.Type}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkUsersTable();
