const db = require('./config/database');

async function checkOPDTable() {
  try {
    console.log('Checking OPD table...');
    
    const [tables] = await db.execute("SHOW TABLES LIKE '%opd%'");
    console.log('OPD-related tables:', tables);
    
    if (tables.length > 0) {
      const tableName = tables[0][Object.keys(tables[0])[0]];
      console.log(`\nTable name: ${tableName}`);
      
      const [columns] = await db.execute(`DESCRIBE ${tableName}`);
      console.log('\nColumns:');
      columns.forEach(col => console.log(`  ${col.Field} - ${col.Type}`));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkOPDTable();
