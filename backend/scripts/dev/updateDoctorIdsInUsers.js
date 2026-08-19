const db = require('./config/database');

async function updateDoctorIdsInUsers() {
  try {
    console.log('Updating doctor_id in users table...');
    
    // Get all doctors with their user_id
    const [doctors] = await db.execute('SELECT id, user_id, first_name, last_name FROM doctors');
    console.log(`Found ${doctors.length} doctors`);
    
    for (const doctor of doctors) {
      if (doctor.user_id) {
        await db.execute(
          'UPDATE users SET doctor_id = ? WHERE id = ?',
          [doctor.id, doctor.user_id]
        );
        console.log(`Updated user ${doctor.user_id} with doctor_id ${doctor.id} for Dr. ${doctor.first_name} ${doctor.last_name}`);
      } else {
        console.log(`No user_id found for Dr. ${doctor.first_name} ${doctor.last_name}`);
      }
    }
    
    console.log('\nDoctor IDs updated successfully!');
    
  } catch (error) {
    console.error('Error updating doctor IDs:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateDoctorIdsInUsers();
