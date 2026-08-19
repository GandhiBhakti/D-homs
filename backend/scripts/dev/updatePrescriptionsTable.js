const db = require('./config/database');

async function updatePrescriptionsTable() {
  try {
    console.log('Updating prescriptions table for enhanced prescription module...');
    
    const columns = [
      'ALTER TABLE prescriptions ADD COLUMN is_capitalized TINYINT(1) DEFAULT 0',
      'ALTER TABLE prescriptions ADD COLUMN medicine_name_gujarati VARCHAR(255) NULL',
      'ALTER TABLE prescriptions ADD COLUMN print_format ENUM("A4", "letterhead") DEFAULT "letterhead"',
      'ALTER TABLE prescriptions ADD COLUMN notes TEXT NULL',
      'ALTER TABLE prescriptions ADD COLUMN print_count INT DEFAULT 0'
    ];
    
    for (const column of columns) {
      try {
        await db.execute(column);
        console.log(`Column added successfully`);
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column already exists, skipping...`);
        } else {
          console.error(`Error adding column:`, err);
        }
      }
    }
    
    console.log('\nPrescriptions table updated successfully!');
    
  } catch (error) {
    console.error('Error updating prescriptions table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updatePrescriptionsTable();
