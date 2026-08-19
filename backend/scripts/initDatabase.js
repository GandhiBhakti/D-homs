const db = require('../config/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Read abdm_migration.sql
    const abdmPath = path.join(__dirname, '../../database/abdm_migration.sql');
    const abdmSchema = fs.readFileSync(abdmPath, 'utf8');
    
    // Execute schema
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      await db.execute(statement);
    }
    console.log('✓ Main schema executed');
    
    // Execute ABDM migration
    const abdmStatements = abdmSchema.split(';').filter(stmt => stmt.trim());
    for (const statement of abdmStatements) {
      await db.execute(statement);
    }
    console.log('✓ ABDM migration executed');
    
    console.log('✓ Database initialization completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('✗ Database initialization failed:', error.message);
    process.exit(1);
  }
}

initializeDatabase();
