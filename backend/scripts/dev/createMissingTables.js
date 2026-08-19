const mysql = require("mysql2/promise");

async function createMissingTables() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hospital_management",
  });

  try {
    // Create patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE,
        gender ENUM('male', 'female', 'other'),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        blood_group VARCHAR(5),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created patients table");

    // Create patient_visits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patient_visits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        visit_type ENUM('OPD', 'IPD') NOT NULL,
        visit_date DATE NOT NULL,
        department_id INT,
        doctor_id INT,
        admission_date DATE,
        discharge_date DATE,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        chief_complaints TEXT,
        diagnosis TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients(id),
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (doctor_id) REFERENCES doctors(id)
      )
    `);
    console.log("Created patient_visits table");

    // Create billing table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS billing (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_visit_id INT,
        patient_id INT NOT NULL,
        bill_date DATE NOT NULL,
        bill_type ENUM('OPD', 'IPD', 'Pharmacy', 'Laboratory', 'Other') NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        status ENUM('pending', 'partial', 'paid', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits(id),
        FOREIGN KEY (patient_id) REFERENCES patients(id)
      )
    `);
    console.log("Created billing table");

    // Create audit_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id INT,
        old_values JSON,
        new_values JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log("Created audit_logs table");

    // Create system_status table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_status (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_name VARCHAR(100) NOT NULL UNIQUE,
        status ENUM('operational', 'degraded', 'down', 'maintenance') DEFAULT 'operational',
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        response_time_ms INT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created system_status table");

    // Create roles table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created roles table");

    // Create permissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created permissions table");

    // Create user_sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        refresh_token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("Created user_sessions table");

    // Create password_resets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Created password_resets table");

    // Create activity_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log("Created activity_logs table");

    // Create indexes
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_patients_id ON patients(patient_id)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_visits_patient ON patient_visits(patient_id)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_visits_date ON patient_visits(visit_date)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_visits_type ON patient_visits(visit_type)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_visits_department ON patient_visits(department_id)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_billing_patient ON billing(patient_id)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_billing_date ON billing(bill_date)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_billing_type ON billing(bill_type)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at)`,
    );
    await connection.execute(
      `CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action)`,
    );
    console.log("Created indexes");

    console.log("All missing tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await connection.end();
  }
}

createMissingTables();
