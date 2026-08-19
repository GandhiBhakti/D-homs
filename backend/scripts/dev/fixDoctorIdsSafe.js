const db = require('../../config/database');

async function fixDoctorIdsSafe() {
  try {
    console.log('Fixing doctor IDs to be sequential (1, 2, 3, etc.) with foreign key handling...');
    
    // Disable foreign key checks temporarily
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all doctors ordered by current ID
    const [doctors] = await db.execute('SELECT id, user_id, email FROM doctors ORDER BY id');
    
    console.log(`Found ${doctors.length} doctor profiles`);
    
    // Create a mapping of old IDs to new IDs
    const idMapping = {};
    for (let i = 0; i < doctors.length; i++) {
      const oldId = doctors[i].id;
      const newId = i + 1;
      idMapping[oldId] = newId;
    }
    
    // Update doctor IDs
    for (let i = 0; i < doctors.length; i++) {
      const oldId = doctors[i].id;
      const newId = i + 1;
      
      await db.execute('UPDATE doctors SET id = ? WHERE id = ?', [newId, oldId]);
      console.log(`Updated doctor ID from ${oldId} to ${newId} for user_id: ${doctors[i].user_id}`);
    }
    
    // Update foreign key references in doctor_commission table
    const [commissions] = await db.execute('SELECT id, doctor_id FROM doctor_commission');
    for (const commission of commissions) {
      const newDoctorId = idMapping[commission.doctor_id];
      if (newDoctorId) {
        await db.execute('UPDATE doctor_commission SET doctor_id = ? WHERE id = ?', [newDoctorId, commission.id]);
        console.log(`Updated commission ID ${commission.id} doctor_id from ${commission.doctor_id} to ${newDoctorId}`);
      }
    }
    
    // Update foreign key references in doctor_leaves table
    const [leaves] = await db.execute('SELECT id, doctor_id FROM doctor_leaves');
    for (const leave of leaves) {
      const newDoctorId = idMapping[leave.doctor_id];
      if (newDoctorId) {
        await db.execute('UPDATE doctor_leaves SET doctor_id = ? WHERE id = ?', [newDoctorId, leave.id]);
        console.log(`Updated leave ID ${leave.id} doctor_id from ${leave.doctor_id} to ${newDoctorId}`);
      }
    }
    
    // Update foreign key references in doctor_availability table
    try {
      const [availabilities] = await db.execute('SELECT id, doctor_id FROM doctor_availability');
      for (const availability of availabilities) {
        const newDoctorId = idMapping[availability.doctor_id];
        if (newDoctorId) {
          await db.execute('UPDATE doctor_availability SET doctor_id = ? WHERE id = ?', [newDoctorId, availability.id]);
          console.log(`Updated availability ID ${availability.id} doctor_id from ${availability.doctor_id} to ${newDoctorId}`);
        }
      }
    } catch (err) {
      console.log('doctor_availability table may not exist, skipping...');
    }
    
    // Reset auto increment
    await db.execute(`ALTER TABLE doctors AUTO_INCREMENT = ${doctors.length + 1}`);
    
    // Re-enable foreign key checks
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`Successfully reset doctor IDs to sequential values (1 to ${doctors.length})`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing doctor IDs:', error);
    // Re-enable foreign key checks in case of error
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    process.exit(1);
  }
}

fixDoctorIdsSafe();
