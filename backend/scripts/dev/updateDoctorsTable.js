const db = require('./config/database');

async function updateDoctorsTable() {
  try {
    console.log('Updating doctors table structure...');
    
    // Add new columns to doctors table
    const columns = [
      'ALTER TABLE doctors ADD COLUMN qualification VARCHAR(255) NULL',
      'ALTER TABLE doctors ADD COLUMN mobile VARCHAR(20) NULL',
      'ALTER TABLE doctors ADD COLUMN opd_commission VARCHAR(50) NULL',
      'ALTER TABLE doctors ADD COLUMN ipd_commission VARCHAR(50) NULL',
      'ALTER TABLE doctors ADD COLUMN ot_commission VARCHAR(50) NULL',
      'ALTER TABLE doctors ADD COLUMN visit_charges DECIMAL(10,2) NULL',
      'ALTER TABLE doctors ADD COLUMN is_active TINYINT(1) DEFAULT 1'
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
    
    console.log('\nDoctors table updated successfully!');
    
  } catch (error) {
    console.error('Error updating doctors table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateDoctorsTable();
