const db = require('./config/database');

async function manageDoctors() {
  try {
    console.log('Managing doctors...');
    
    // 1. Set Dr. Bhavesh Khandhar as inactive (ID 5) instead of deleting to preserve data integrity
    console.log('\n1. Setting Dr. Bhavesh Khandhar as inactive...');
    await db.execute('UPDATE doctors SET is_active = 0 WHERE id = 5');
    await db.execute('UPDATE users SET is_active = 0 WHERE id = 58');
    console.log('Dr. Bhavesh Khandhar set as inactive successfully');
    
    // 2. Add new doctors
    console.log('\n2. Adding new doctors...');
    
    const newDoctors = [
      {
        first_name: 'Saira',
        last_name: '',
        email: 'saira@hospital.com',
        phone: '9876543225',
        department_id: 4, // Plastic Surgery - need to check department ID
        qualification: 'MS - Plastic Surgery',
        opd_commission: '100% OPD',
        ipd_commission: null,
        ot_commission: null,
        visit_charges: 500,
        is_active: 1,
        specialization: 'Plastic Surgery'
      },
      {
        first_name: 'Bhaumik',
        last_name: 'Chudasama',
        email: 'bhaumik@hospital.com',
        phone: '9876543226',
        department_id: 2, // Neurosurgery - need to check department ID
        qualification: 'MCh - Neurosurgery',
        opd_commission: '100% OPD',
        ipd_commission: null,
        ot_commission: null,
        visit_charges: 600,
        is_active: 1,
        specialization: 'Neurosurgery'
      },
      {
        first_name: 'Kushal',
        last_name: 'Kapashi',
        email: 'kushal@hospital.com',
        phone: '9876543227',
        department_id: 3, // Urosurgery - need to check department ID
        qualification: 'MCh - Urology',
        opd_commission: 'Custom',
        ipd_commission: 'Custom',
        ot_commission: 'Custom',
        visit_charges: 700,
        is_active: 1,
        specialization: 'Urosurgery'
      },
      {
        first_name: 'Gunjanba',
        last_name: 'Gohil',
        email: 'gunjanba@hospital.com',
        phone: '9876543228',
        department_id: 5, // Pathology - need to check department ID
        qualification: 'MD - Pathology',
        opd_commission: 'Laboratory',
        ipd_commission: null,
        ot_commission: null,
        visit_charges: 300,
        is_active: 1,
        specialization: 'Pathology'
      },
      {
        first_name: 'Priya',
        last_name: 'Savsani',
        email: 'priyasavsani@hospital.com',
        phone: '9876543229',
        department_id: 2, // ENT
        qualification: 'MS - ENT',
        opd_commission: '80% Doctor / 20% Hospital',
        ipd_commission: '80% Doctor / 20% Hospital',
        ot_commission: null,
        visit_charges: 400,
        is_active: 1,
        specialization: 'ENT'
      },
      {
        first_name: 'Hensi',
        last_name: 'Mangera',
        email: 'hensi@hospital.com',
        phone: '9876543230',
        department_id: 3, // Physiotherapy
        qualification: 'BPTh - Physiotherapy',
        opd_commission: 'Custom',
        ipd_commission: null,
        ot_commission: null,
        visit_charges: 250,
        is_active: 1,
        specialization: 'Physiotherapy'
      }
    ];
    
    // First, let's check existing departments
    const [departments] = await db.execute('SELECT id, name FROM departments');
    console.log('\nExisting departments:');
    departments.forEach(dept => console.log(`  ID: ${dept.id} - ${dept.name}`));
    
    // Map department names to IDs based on actual departments
    const deptMap = {
      'Plastic Surgery': 13, // Surgery
      'Neurosurgery': 12,
      'Urosurgery': 14,
      'Pathology': 1, // Medicines (closest)
      'ENT': 2,
      'Physiotherapy': 3
    };
    
    for (const doctor of newDoctors) {
      const deptId = deptMap[doctor.specialization] || doctor.department_id;
      
      // Check if doctor already exists
      const [existing] = await db.execute('SELECT id FROM doctors WHERE email = ?', [doctor.email]);
      
      if (existing.length > 0) {
        console.log(`Dr. ${doctor.first_name} ${doctor.last_name} already exists (ID: ${existing[0].id}), skipping...`);
        continue;
      }
      
      // Insert into doctors table
      const [result] = await db.execute(
        `INSERT INTO doctors (first_name, last_name, email, phone, department_id, qualification, opd_commission, ipd_commission, ot_commission, visit_charges, is_active, specialization) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [doctor.first_name, doctor.last_name, doctor.email, doctor.phone, deptId, doctor.qualification, doctor.opd_commission, doctor.ipd_commission, doctor.ot_commission, doctor.visit_charges, doctor.is_active, doctor.specialization]
      );
      
      const doctorId = result.insertId;
      
      // Create user account for the doctor
      const username = doctor.first_name.toLowerCase() + (doctor.last_name ? doctor.last_name.toLowerCase() : '');
      const password = 'doctor123'; // Default password
      
      const [userResult] = await db.execute(
        `INSERT INTO users (username, email, password, first_name, last_name, role, doctor_id) 
         VALUES (?, ?, ?, ?, ?, 'doctor', ?)`,
        [username, doctor.email, password, doctor.first_name, doctor.last_name, doctorId]
      );
      
      // Update doctor with user_id
      await db.execute('UPDATE doctors SET user_id = ? WHERE id = ?', [userResult.insertId, doctorId]);
      
      console.log(`Added Dr. ${doctor.first_name} ${doctor.last_name} (ID: ${doctorId})`);
    }
    
    console.log('\nAll doctors managed successfully!');
    
  } catch (error) {
    console.error('Error managing doctors:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

manageDoctors();
