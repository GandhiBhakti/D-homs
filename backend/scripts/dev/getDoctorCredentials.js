const db = require('./config/database');

async function getDoctorCredentials() {
  try {
    console.log('Getting doctor credentials...');
    
    const [rows] = await db.execute(`
      SELECT d.id as doctor_id, d.first_name, d.last_name, d.email, d.phone,
             u.id as user_id, u.username, u.email as user_email, u.role
      FROM doctors d
      LEFT JOIN users u ON d.user_id = u.id
    `);
    
    console.log('Doctor credentials:');
    rows.forEach(row => {
      console.log(`\nDoctor ID: ${row.doctor_id}`);
      console.log(`Name: Dr. ${row.first_name} ${row.last_name}`);
      console.log(`Email: ${row.email}`);
      console.log(`Phone: ${row.phone}`);
      if (row.user_id) {
        console.log(`User ID: ${row.user_id}`);
        console.log(`Username: ${row.username}`);
        console.log(`User Email: ${row.user_email}`);
        console.log(`Role: ${row.role}`);
      } else {
        console.log(`No user account linked`);
      }
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

getDoctorCredentials();
