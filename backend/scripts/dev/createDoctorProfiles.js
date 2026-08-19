const db = require('../../config/database');

async function createDoctorProfiles() {
  try {
    console.log('Creating doctor profiles for doctor users without profiles...');
    
    // Get all doctor users
    const [users] = await db.execute(
      'SELECT id, email, first_name, last_name FROM users WHERE role = ?',
      ['doctor']
    );
    
    console.log(`Found ${users.length} doctor users`);
    
    // Get all doctors
    const [doctors] = await db.execute('SELECT id, email, user_id FROM doctors');
    
    console.log(`Found ${doctors.length} doctor profiles`);
    
    // Find users without doctor profiles
    const usersWithoutProfiles = users.filter(user => 
      !doctors.some(doc => doc.user_id === user.id)
    );
    
    console.log(`Found ${usersWithoutProfiles.length} doctor users without profiles`);
    
    let createdCount = 0;
    
    for (const user of usersWithoutProfiles) {
      // Create a doctor profile for this user
      const [result] = await db.execute(
        'INSERT INTO doctors (user_id, first_name, last_name, email, phone, department_id, designation_id, specialization, qualification, experience_years, consultation_fee, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user.id,
          user.first_name || 'Doctor',
          user.last_name || 'Name',
          user.email,
          '0000000000',
          1, // Default department
          1, // Default designation
          'General Medicine',
          'MBBS',
          5,
          500,
          true
        ]
      );
      
      console.log(`Created doctor profile for user ${user.email} (ID: ${user.id}) with doctor ID: ${result.insertId}`);
      createdCount++;
    }
    
    console.log(`Successfully created ${createdCount} doctor profiles`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating doctor profiles:', error);
    process.exit(1);
  }
}

createDoctorProfiles();
