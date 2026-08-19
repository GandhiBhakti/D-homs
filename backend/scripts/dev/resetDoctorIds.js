const db = require('./config/database');

async function resetDoctorIds() {
  try {
    console.log('Fetching current doctors...');
    const [doctors] = await db.execute('SELECT id, first_name, last_name FROM doctors ORDER BY id');
    console.log(`Current doctors: ${doctors.length}`);

    // Disable foreign key checks temporarily
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');

    // Create a mapping of old IDs to new sequential IDs
    const idMapping = {};
    doctors.forEach((doctor, index) => {
      idMapping[doctor.id] = index + 1;
    });

    console.log('\nID mapping:');
    Object.entries(idMapping).forEach(([oldId, newId]) => {
      const doctor = doctors.find(d => d.id === parseInt(oldId));
      console.log(`ID ${oldId} (Dr. ${doctor.first_name} ${doctor.last_name}) -> ID ${newId}`);
    });

    // Update all related tables with new IDs
    console.log('\nUpdating related tables...');

    // Update patient_visits
    for (const [oldId, newId] of Object.entries(idMapping)) {
      await db.execute('UPDATE patient_visits SET doctor_id = ? WHERE doctor_id = ?', [newId, oldId]);
    }
    console.log('Updated patient_visits');

    // Update doctor_schedule
    for (const [oldId, newId] of Object.entries(idMapping)) {
      await db.execute('UPDATE doctor_schedule SET doctor_id = ? WHERE doctor_id = ?', [newId, oldId]);
    }
    console.log('Updated doctor_schedule');

    // Update doctor_availability
    for (const [oldId, newId] of Object.entries(idMapping)) {
      await db.execute('UPDATE doctor_availability SET doctor_id = ? WHERE doctor_id = ?', [newId, oldId]);
    }
    console.log('Updated doctor_availability');

    // Update doctor_leaves
    for (const [oldId, newId] of Object.entries(idMapping)) {
      await db.execute('UPDATE doctor_leaves SET doctor_id = ? WHERE doctor_id = ?', [newId, oldId]);
    }
    console.log('Updated doctor_leaves');

    // Update doctor_commission
    for (const [oldId, newId] of Object.entries(idMapping)) {
      await db.execute('UPDATE doctor_commission SET doctor_id = ? WHERE doctor_id = ?', [newId, oldId]);
    }
    console.log('Updated doctor_commission');

    // Update doctors table with new IDs
    console.log('\nUpdating doctor IDs...');
    for (const [oldId, newId] of Object.entries(idMapping)) {
      await db.execute('UPDATE doctors SET id = ? WHERE id = ?', [newId, oldId]);
    }
    console.log('Updated doctors table');

    // Re-enable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    // Reset auto-increment to next value
    await db.execute('ALTER TABLE doctors AUTO_INCREMENT = 6');
    console.log('Reset auto-increment to 6');

    // Verify
    console.log('\nVerification:');
    const [updatedDoctors] = await db.execute('SELECT id, first_name, last_name FROM doctors ORDER BY id');
    console.log(`Total doctors: ${updatedDoctors.length}`);
    updatedDoctors.forEach(d => {
      console.log(`- ID ${d.id}: Dr. ${d.first_name} ${d.last_name}`);
    });

    console.log('\nDoctor IDs reset successfully!');

  } catch (error) {
    console.error('Error during ID reset:', error);
    // Re-enable foreign key checks in case of error
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
  } finally {
    await db.end();
    process.exit(0);
  }
}

resetDoctorIds();
