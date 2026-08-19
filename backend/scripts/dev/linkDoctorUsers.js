const db = require('../../config/database');

async function linkDoctorUsers() {
  try {
    console.log('Linking doctor user accounts to doctor profiles...');
    
    // Get all doctor users
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name FROM users WHERE role = ?',
      ['doctor']
    );
    
    console.log(`Found ${users.length} doctor users`);
    
    // Get all doctors
    const [doctors] = await db.execute('SELECT id, email, first_name, last_name, user_id FROM doctors');
    
    console.log(`Found ${doctors.length} doctor profiles`);
    
    let linkedCount = 0;
    
    for (const user of users) {
      // Try to find a doctor profile by email
      const doctor = doctors.find(d => d.email === user.email);
      
      if (doctor) {
        // Update the doctor profile with the user_id
        await db.execute(
          'UPDATE doctors SET user_id = ? WHERE id = ?',
          [user.id, doctor.id]
        );
        console.log(`Linked user ${user.email} (ID: ${user.id}) to doctor profile (ID: ${doctor.id})`);
        linkedCount++;
      } else {
        console.log(`No doctor profile found for user ${user.email}`);
      }
    }
    
    console.log(`Successfully linked ${linkedCount} doctor user accounts to their profiles`);
    process.exit(0);
  } catch (error) {
    console.error('Error linking doctor users:', error);
    process.exit(1);
  }
}

linkDoctorUsers();
