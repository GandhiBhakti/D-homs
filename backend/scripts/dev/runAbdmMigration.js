const db = require('./config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('Starting ABDM database migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/abdm_migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split by semicolon to execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        await db.execute(statement);
        console.log('✓ Executed statement');
      }
    }
    
    console.log('✓ ABDM migration completed successfully!');
    console.log('Tables created:');
    console.log('  - patient_abha');
    console.log('  - care_context');
    console.log('  - consent_artefact');
    console.log('  - health_data_exchange');
    console.log('  - abdm_audit_log');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
