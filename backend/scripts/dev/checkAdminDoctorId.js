const db = require('./config/database');

async function checkAdminDoctorId() {
  try {
    console.log('Checking admin user doctor_id...');
    
    const [rows] = await db.execute('SELECT id, username, first_name, last_name, role, doctor_id FROM users WHERE username = ?', ['admin']);
    
    if (rows.length > 0) {
      console.log('Admin user found:');
      console.log(JSON.stringify(rows[0], null, 2));
    } else {
      console.log('Admin user not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkAdminDoctorId();
