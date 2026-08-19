const db = require('./config/database');

async function checkAllTables() {
  try {
    console.log('Checking all tables...');
    
    const [tables] = await db.execute("SHOW TABLES");
    console.log('\nAll tables:');
    tables.forEach(table => console.log(`  ${Object.values(table)[0]}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

checkAllTables();
