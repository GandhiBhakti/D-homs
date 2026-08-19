const db = require('../../config/database');

async function fixDoctorIds() {
  try {
    console.log('Fixing doctor IDs to be sequential (1, 2, 3, etc.)...');
    
    // Get all doctors ordered by current ID
    const [doctors] = await db.execute('SELECT id, user_id, email FROM doctors ORDER BY id');
    
    console.log(`Found ${doctors.length} doctor profiles`);
    
    // Reset auto increment
    await db.execute('SET @auto_increment = 0');
    await db.execute('ALTER TABLE doctors AUTO_INCREMENT = 1');
    
    // Update IDs to be sequential
    for (let i = 0; i < doctors.length; i++) {
      const oldId = doctors[i].id;
      const newId = i + 1;
      
      await db.execute('UPDATE doctors SET id = ? WHERE id = ?', [newId, oldId]);
      console.log(`Updated doctor ID from ${oldId} to ${newId} for user_id: ${doctors[i].user_id}`);
    }
    
    // Reset auto increment to next value
    await db.execute('ALTER TABLE doctors AUTO_INCREMENT = ?', [doctors.length + 1]);
    
    console.log(`Successfully reset doctor IDs to sequential values (1 to ${doctors.length})`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing doctor IDs:', error);
    process.exit(1);
  }
}

fixDoctorIds();
