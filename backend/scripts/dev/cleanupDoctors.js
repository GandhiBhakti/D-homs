const db = require('./config/database');

const allowedDoctorIds = [46, 47, 48, 49, 50];

async function cleanupDoctors() {
  try {
    console.log('Fetching all doctors...');
    const [doctors] = await db.execute('SELECT id, first_name, last_name FROM doctors');
    console.log(`Total doctors found: ${doctors.length}`);

    console.log('\nDoctors to keep:');
    allowedDoctorIds.forEach(id => {
      const doctor = doctors.find(d => d.id === id);
      if (doctor) {
        console.log(`- ID ${id}: Dr. ${doctor.first_name} ${doctor.last_name}`);
      } else {
        console.log(`- ID ${id}: NOT FOUND in database`);
      }
    });

    console.log('\nDoctors to delete:');
    const doctorsToDelete = doctors.filter(d => !allowedDoctorIds.includes(d.id));
    
    if (doctorsToDelete.length === 0) {
      console.log('No doctors to delete.');
      return;
    }

    doctorsToDelete.forEach(doctor => {
      console.log(`- ID ${doctor.id}: Dr. ${doctor.first_name} ${doctor.last_name}`);
    });

    console.log('\nDeleting doctors and their related records...');
    for (const doctor of doctorsToDelete) {
      // Delete related patient_visits first
      await db.execute('DELETE FROM patient_visits WHERE doctor_id = ?', [doctor.id]);
      // Delete related schedules
      await db.execute('DELETE FROM doctor_schedule WHERE doctor_id = ?', [doctor.id]);
      // Delete related availability
      await db.execute('DELETE FROM doctor_availability WHERE doctor_id = ?', [doctor.id]);
      // Delete related leaves
      await db.execute('DELETE FROM doctor_leaves WHERE doctor_id = ?', [doctor.id]);
      // Delete related commission
      await db.execute('DELETE FROM doctor_commission WHERE doctor_id = ?', [doctor.id]);
      // Delete the doctor
      await db.execute('DELETE FROM doctors WHERE id = ?', [doctor.id]);
      console.log(`Deleted: Dr. ${doctor.first_name} ${doctor.last_name} (ID: ${doctor.id})`);
    }

    console.log('\nCleanup completed successfully.');
    
    // Verify
    const [remaining] = await db.execute('SELECT id, first_name, last_name FROM doctors');
    console.log(`\nRemaining doctors: ${remaining.length}`);
    remaining.forEach(d => {
      console.log(`- ID ${d.id}: Dr. ${d.first_name} ${d.last_name}`);
    });

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

cleanupDoctors();
