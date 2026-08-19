const mysql = require('mysql2/promise');

async function resetDepartmentIds() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Resetting department IDs...');
    
    // Update doctors to set department_id to NULL
    await connection.execute('UPDATE doctors SET department_id = NULL');
    console.log('Updated doctors');
    
    // Update patient_visits to set department_id to NULL
    await connection.execute('UPDATE patient_visits SET department_id = NULL');
    console.log('Updated patient_visits');
    
    // Delete all departments
    await connection.execute('DELETE FROM departments');
    console.log('Deleted all departments');
    
    // Reset auto-increment to 1
    await connection.execute('ALTER TABLE departments AUTO_INCREMENT = 1');
    console.log('Reset auto-increment to 1');
    
    // Insert the desired departments
    await connection.execute(`
      INSERT INTO departments (name, description) VALUES
      ('Medicine', 'General medicine and primary care'),
      ('ENT', 'Ear, Nose, and Throat specialist'),
      ('Physiotherapy', 'Physical therapy and rehabilitation'),
      ('Radiology', 'Medical imaging and diagnostics'),
      ('Spine Surgery', 'Spinal surgery and treatments'),
      ('Pediatrics', 'Child healthcare and pediatrics'),
      ('Anesthesia', 'Anesthesiology and pain management'),
      ('Neurology', 'Brain and nervous system'),
      ('Orthopaedic', 'Bone and joint treatments'),
      ('General physician', 'General medical care'),
      ('Chest Physician', 'Respiratory and chest specialist'),
      ('Neurosurgery', 'Brain and spinal surgery'),
      ('Surgery', 'General surgery'),
      ('Urology', 'Urinary tract and kidney specialist')
    `);
    console.log('Inserted departments with sequential IDs');
    console.log('Department IDs reset successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

resetDepartmentIds();
