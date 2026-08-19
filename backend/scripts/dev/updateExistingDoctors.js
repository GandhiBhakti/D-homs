const db = require('./config/database');

async function updateExistingDoctors() {
  try {
    console.log('Updating existing doctors with experience years and fees...');
    
    // Update Dr. Saira
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 15, consultation_fee = 500, visit_charges = 500
      WHERE first_name = 'Saira'
    `);
    console.log('Updated Dr. Saira');
    
    // Update Dr. Bhaumik Chudasama
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 20, consultation_fee = 800, visit_charges = 800
      WHERE first_name = 'Bhaumik'
    `);
    console.log('Updated Dr. Bhaumik Chudasama');
    
    // Update Dr. Kushal Kapashi
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 18, consultation_fee = 700, visit_charges = 700
      WHERE first_name = 'Kushal'
    `);
    console.log('Updated Dr. Kushal Kapashi');
    
    // Update Dr. Gunjanba Gohil
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 12, consultation_fee = 300, visit_charges = 300
      WHERE first_name = 'Gunjanba'
    `);
    console.log('Updated Dr. Gunjanba Gohil');
    
    // Update Dr. Priya Savsani
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 10, consultation_fee = 400, visit_charges = 400
      WHERE first_name = 'Priya'
    `);
    console.log('Updated Dr. Priya Savsani');
    
    // Update Dr. Hensi Mangera
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 8, consultation_fee = 250, visit_charges = 250
      WHERE first_name = 'Hensi'
    `);
    console.log('Updated Dr. Hensi Mangera');
    
    // For any other doctors without experience years, set default values
    await db.execute(`
      UPDATE doctors 
      SET experience_years = 5, consultation_fee = 300, visit_charges = 300
      WHERE experience_years IS NULL OR experience_years = 0
    `);
    console.log('Updated doctors with default values');
    
    console.log('\nAll doctors updated successfully!');
  } catch (error) {
    console.error('Error updating doctors:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

updateExistingDoctors();
