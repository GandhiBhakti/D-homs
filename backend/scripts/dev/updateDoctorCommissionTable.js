const db = require('./config/database');

async function updateDoctorCommissionTable() {
  try {
    console.log('Updating doctor_commission table for separate OPD/IPD/OT commissions...');
    
    const columns = [
      'ALTER TABLE doctor_commission ADD COLUMN opd_commission_type ENUM("percentage", "fixed", "custom") DEFAULT "percentage"',
      'ALTER TABLE doctor_commission ADD COLUMN opd_commission_value DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE doctor_commission ADD COLUMN opd_custom_formula TEXT NULL',
      'ALTER TABLE doctor_commission ADD COLUMN ipd_commission_type ENUM("percentage", "fixed", "custom") DEFAULT "percentage"',
      'ALTER TABLE doctor_commission ADD COLUMN ipd_commission_value DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE doctor_commission ADD COLUMN ipd_custom_formula TEXT NULL',
      'ALTER TABLE doctor_commission ADD COLUMN ot_commission_type ENUM("percentage", "fixed", "custom") DEFAULT "percentage"',
      'ALTER TABLE doctor_commission ADD COLUMN ot_commission_value DECIMAL(10,2) DEFAULT 0',
      'ALTER TABLE doctor_commission ADD COLUMN ot_custom_formula TEXT NULL',
      'ALTER TABLE doctor_commission ADD COLUMN cost_deduction TINYINT(1) DEFAULT 0',
      'ALTER TABLE doctor_commission ADD COLUMN cost_deduction_amount DECIMAL(10,2) DEFAULT 0'
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
    
    console.log('\nDoctor commission table updated successfully!');
    
  } catch (error) {
    console.error('Error updating doctor commission table:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateDoctorCommissionTable();
