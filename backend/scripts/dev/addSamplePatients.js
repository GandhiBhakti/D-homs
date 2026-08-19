const db = require('./config/database');

async function addSamplePatients() {
  try {
    console.log('Adding sample patients and OPD visits...');
    
    // Insert sample patients
    const patients = [
      { patient_id: 'PAT00001', first_name: 'Rajesh', last_name: 'Patel', date_of_birth: '1985-05-15', gender: 'male', phone: '9876543210', email: 'rajesh@email.com', address: 'Ahmedabad', blood_group: 'B+' },
      { patient_id: 'PAT00002', first_name: 'Priya', last_name: 'Shah', date_of_birth: '1990-08-22', gender: 'female', phone: '9876543211', email: 'priya@email.com', address: 'Surat', blood_group: 'O+' },
      { patient_id: 'PAT00003', first_name: 'Amit', last_name: 'Singh', date_of_birth: '1988-03-10', gender: 'male', phone: '9876543212', email: 'amit@email.com', address: 'Vadodara', blood_group: 'A+' },
      { patient_id: 'PAT00004', first_name: 'Neha', last_name: 'Joshi', date_of_birth: '1992-11-05', gender: 'female', phone: '9876543213', email: 'neha@email.com', address: 'Rajkot', blood_group: 'AB+' },
      { patient_id: 'PAT00005', first_name: 'Vikram', last_name: 'Mehta', date_of_birth: '1980-07-20', gender: 'male', phone: '9876543214', email: 'vikram@email.com', address: 'Bhavnagar', blood_group: 'B+' },
    ];
    
    const patientIds = [];
    for (const patient of patients) {
      try {
        const [result] = await db.execute(
          `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, address, blood_group) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [patient.patient_id, patient.first_name, patient.last_name, patient.date_of_birth, patient.gender, patient.phone, patient.email, patient.address, patient.blood_group]
        );
        patientIds.push(result.insertId);
        console.log(`Inserted patient: ${patient.first_name} ${patient.last_name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Patient already exists: ${patient.patient_id}`);
          // Get existing patient ID
          const [existing] = await db.execute('SELECT id FROM patients WHERE patient_id = ?', [patient.patient_id]);
          patientIds.push(existing[0].id);
        }
      }
    }
    
    // Get doctor IDs
    const [doctors] = await db.execute('SELECT id, first_name FROM doctors ORDER BY id LIMIT 6');
    const doctorIds = doctors.map(d => d.id);
    
    // Get department IDs
    const [departments] = await db.execute('SELECT id, name FROM departments ORDER BY id LIMIT 6');
    const departmentIds = departments.map(d => d.id);
    
    // Insert OPD visits for today
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      const doctorId = doctorIds[i % doctorIds.length];
      const deptId = departmentIds[i % departmentIds.length];
      
      try {
        await db.execute(
          `INSERT INTO patient_visits (patient_id, visit_type, visit_date, department_id, doctor_id, status, chief_complaints) VALUES (?, 'OPD', ?, ?, ?, 'completed', ?)`,
          [patientId, today, deptId, doctorId, 'Routine checkup']
        );
        console.log(`Inserted OPD visit for patient ${i + 1}`);
      } catch (err) {
        console.log(`Visit already exists for patient ${i + 1}`);
      }
    }
    
    console.log('\nSample patients and OPD visits added successfully!');
    console.log('You can now see patients in the OPD List.');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

addSamplePatients();
