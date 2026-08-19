const db = require('./config/database');

async function updateBillingTable() {
  try {
    console.log('Updating billing table for OPD billing components...');
    
    const columns = [
      'ALTER TABLE billing ADD COLUMN registration_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN consultation_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN specialist_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN emergency_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN xray_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN ecg_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN injection_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN plaster_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN other_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN payment_mode ENUM("Cash", "UPI", "GPay", "Card", "Credit") DEFAULT "Cash"',
      'ALTER TABLE billing ADD COLUMN transaction_id VARCHAR(100) NULL'
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
    
    console.log('\nBilling table updated successfully for OPD billing components!');
    
  } catch (error) {
    console.error('Error updating billing table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateBillingTable();
