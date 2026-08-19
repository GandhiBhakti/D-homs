const mysql = require('mysql2/promise');

async function seedData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hospital_management'
  });

  try {
    console.log('Seeding essential structural data...');

    // Insert departments (ignore if exists)
    await connection.execute(`
      INSERT IGNORE INTO departments (name, description) VALUES
      ('Plastic Surgery', 'Plastic and reconstructive surgery'),
      ('Neurosurgery', 'Brain and spinal surgery'),
      ('Urosurgery', 'Urinary tract and kidney surgery'),
      ('Pathology', 'Laboratory and pathology services'),
      ('ENT', 'Ear, Nose, and Throat specialist'),
      ('Physiotherapy', 'Physical therapy and rehabilitation'),
      ('Medicine', 'General medicine and primary care'),
      ('Radiology', 'Medical imaging and diagnostics'),
      ('Anesthesia', 'Anesthesiology and pain management'),
      ('Orthopaedic', 'Bone and joint treatments'),
      ('Surgery', 'General surgery')
    `);
    console.log('Departments seeded');

    // Insert or update admin user
    await connection.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, role, phone, is_active) VALUES
      ('admin', 'admin@gmail.com', 'admin123', 'System', 'Admin', 'admin', '0000000000', 1)
      ON DUPLICATE KEY UPDATE password = 'admin123'
    `);
    console.log('Admin user seeded');

    // Insert or update doctor users (username = email)
    await connection.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, role, phone, is_active) VALUES
      ('saira@gmail.com', 'saira@gmail.com', '12345678', 'Saira', '', 'doctor', '9876543211', 1),
      ('bhaumik@gmail.com', 'bhaumik@gmail.com', '12345678', 'Bhaumik', 'Chudasama', 'doctor', '9876543212', 1),
      ('kushal@gmail.com', 'kushal@gmail.com', '12345678', 'Kushal', 'Kapashi', 'doctor', '9876543213', 1),
      ('gunjanba@gmail.com', 'gunjanba@gmail.com', '12345678', 'Gunjanba', 'Gohil', 'doctor', '9876543214', 1),
      ('priya@gmail.com', 'priya@gmail.com', '12345678', 'Priya', 'Savsani', 'doctor', '9876543215', 1),
      ('hensi@gmail.com', 'hensi@gmail.com', '12345678', 'Hensi', 'Mangera', 'doctor', '9876543216', 1)
      ON DUPLICATE KEY UPDATE username = VALUES(username), password = VALUES(password)
    `);
    console.log('Doctor users seeded');

    // Insert or update receptionist users (username = email, password = 123456789)
    await connection.execute(`
      INSERT INTO users (username, email, password, first_name, last_name, role, phone, is_active) VALUES
      ('neha@gmail.com', 'neha@gmail.com', '123456789', 'Neha', 'Sharma', 'receptionist', '9876543221', 1),
      ('rani@gmail.com', 'rani@gmail.com', '123456789', 'Rani', 'Patel', 'receptionist', '9876543222', 1)
      ON DUPLICATE KEY UPDATE username = VALUES(username), password = VALUES(password)
    `);
    console.log('Receptionist users seeded');

    // Insert the 6 specified doctors (ignore if exists)
    await connection.execute(`
      INSERT IGNORE INTO doctors (user_id, first_name, last_name, email, phone, department_id, specialization, qualification, experience_years, consultation_fee, visit_charges, is_available, is_active) VALUES
      (NULL, 'Saira', '', 'saira@gmail.com', '9876543211', 1, 'Plastic Surgery', 'MS', 15, 500, 500, 1, 1),
      (NULL, 'Bhaumik', 'Chudasama', 'bhaumik@gmail.com', '9876543212', 2, 'Neurosurgery', 'MCh', 20, 800, 800, 1, 1),
      (NULL, 'Kushal', 'Kapashi', 'kushal@gmail.com', '9876543213', 3, 'Urosurgery', 'MCh', 18, 700, 700, 1, 1),
      (NULL, 'Gunjanba', 'Gohil', 'gunjanba@gmail.com', '9876543214', 4, 'Pathology', 'MD', 12, 300, 300, 1, 1),
      (NULL, 'Priya', 'Savsani', 'priya@gmail.com', '9876543215', 5, 'ENT', 'MS', 10, 400, 400, 1, 1),
      (NULL, 'Hensi', 'Mangera', 'hensi@gmail.com', '9876543216', 6, 'Physiotherapy', 'BPTh', 8, 250, 250, 1, 1)
    `);
    console.log('Doctors seeded');

    // Get doctor IDs to insert commission records
    const [doctors] = await connection.execute('SELECT id, first_name FROM doctors ORDER BY id');
    
    // Insert doctor commission records
    for (const doctor of doctors) {
      let opdType = 'percentage';
      let opdValue = 0;
      let ipdType = 'percentage';
      let ipdValue = 0;
      let otType = 'percentage';
      let otValue = 0;
      
      if (doctor.first_name === 'Saira') {
        opdType = 'percentage';
        opdValue = 100;
      } else if (doctor.first_name === 'Bhaumik') {
        opdType = 'percentage';
        opdValue = 100;
      } else if (doctor.first_name === 'Kushal') {
        opdType = 'custom';
        opdValue = '60% Doctor / 40% Hospital';
        ipdType = 'custom';
        ipdValue = '60% Doctor / 40% Hospital';
        otType = 'custom';
        otValue = '60% Doctor / 40% Hospital';
      } else if (doctor.first_name === 'Gunjanba') {
        // Laboratory - no commission
      } else if (doctor.first_name === 'Priya') {
        opdType = 'percentage';
        opdValue = 80;
        ipdType = 'percentage';
        ipdValue = 20;
        otType = 'percentage';
        otValue = 20;
      } else if (doctor.first_name === 'Hensi') {
        opdType = 'custom';
        opdValue = 'Custom';
        ipdType = 'custom';
        ipdValue = 'Custom';
        otType = 'custom';
        otValue = 'Custom';
      }
      
      await connection.execute(`
        INSERT IGNORE INTO doctor_commission (doctor_id, opd_commission_type, opd_commission_value, ipd_commission_type, ipd_commission_value, ot_commission_type, ot_commission_value, cost_deduction)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0)
      `, [doctor.id, opdType, opdValue, ipdType, ipdValue, otType, otValue]);
    }
    console.log('Doctor commissions seeded');

    console.log('Essential structural data seeded successfully!');
    console.log('No dummy patient data included. System is ready for real patient registration.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await connection.end();
  }
}

seedData();
