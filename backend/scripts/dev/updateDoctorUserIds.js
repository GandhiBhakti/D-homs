const mysql = require('mysql2/promise');

async function updateDoctorUserIds() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Updating doctor user_ids...');

    // Get user IDs for rahul and priya
    const [users] = await connection.execute(`
      SELECT id, username FROM users WHERE username IN ('rahul', 'priya')
    `);
    
    const userIdMap = {};
    users.forEach(user => {
      userIdMap[user.username] = user.id;
    });

    console.log('User IDs:', userIdMap);

    // Update Rahul Sharma's doctor record
    if (userIdMap.rahul) {
      await connection.execute(`
        UPDATE doctors SET user_id = ? WHERE first_name = 'Rahul' AND last_name = 'Sharma'
      `, [userIdMap.rahul]);
      console.log('Updated Rahul Sharma user_id to:', userIdMap.rahul);
    }

    // Update Priya Patel's doctor record
    if (userIdMap.priya) {
      await connection.execute(`
        UPDATE doctors SET user_id = ? WHERE first_name = 'Priya' AND last_name = 'Patel'
      `, [userIdMap.priya]);
      console.log('Updated Priya Patel user_id to:', userIdMap.priya);
    }

    // Verify the updates
    const [doctors] = await connection.execute(`
      SELECT id, user_id, first_name, last_name, email FROM doctors
    `);
    console.log('Updated doctors:');
    doctors.forEach(doc => {
      console.log(`- ${doc.first_name} ${doc.last_name}: user_id = ${doc.user_id}`);
    });

    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error updating doctor user_ids:', error);
  } finally {
    await connection.end();
  }
}

updateDoctorUserIds();
