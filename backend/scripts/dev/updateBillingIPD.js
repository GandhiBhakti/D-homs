const db = require('./config/database');

async function updateBillingIPD() {
  try {
    console.log('Updating billing table for IPD billing components...');
    
    const columns = [
      'ALTER TABLE billing ADD COLUMN room_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN bed_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN doctor_visit_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN surgeon_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN ot_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN implant_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN biomedical_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN rmo_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN medicines_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN lab_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN anesthesia_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN blood_charge DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN other_charge_1 DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN other_charge_2 DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN other_charge_3 DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN advance_amount DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE billing ADD COLUMN refund_type ENUM("in-house", "out-house") NULL'
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
    
    console.log('\nBilling table updated successfully for IPD billing components!');
    
  } catch (error) {
    console.error('Error updating billing table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateBillingIPD();
