const mysql = require('mysql2/promise');

async function removeDepartments() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Removing departments...');
    
    // First, get the IDs of departments to remove
    const [deptIds] = await connection.execute(`
      SELECT id FROM departments WHERE name IN (
        'Inventory',
        'General Medicine',
        'Gynecology',
        'Cardiology',
        'Dermatology',
        'Ophthalmology'
      )
    `);
    
    const ids = deptIds.map(row => row.id);
    
    if (ids.length > 0) {
      // Update doctors to set department_id to NULL for these departments
      await connection.execute(`
        UPDATE doctors SET department_id = NULL WHERE department_id IN (${ids.join(',')})
      `);
      console.log('Updated doctors to remove department references');
      
      // Update patient_visits to set department_id to NULL for these departments
      await connection.execute(`
        UPDATE patient_visits SET department_id = NULL WHERE department_id IN (${ids.join(',')})
      `);
      console.log('Updated patient_visits to remove department references');
      
      // Now delete the departments
      await connection.execute(`
        DELETE FROM departments WHERE id IN (${ids.join(',')})
      `);
      console.log('Departments removed successfully');
    } else {
      console.log('No matching departments found to remove');
    }
  } catch (error) {
    console.error('Error removing departments:', error.message);
  } finally {
    await connection.end();
  }
}

removeDepartments();
