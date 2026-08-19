const db = require('./config/database');

async function checkPatientVisitsTable() {
  try {
    console.log('Checking patient_visits table structure...');
    
    const [columns] = await db.execute('DESCRIBE patient_visits');
    console.log('\nColumns:');
    columns.forEach(col => console.log(`  ${col.Field} - ${col.Type}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkPatientVisitsTable();
