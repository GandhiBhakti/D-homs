-- Hospital Management System Database Schema
-- Departments Table
CREATE TABLE
    departments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Designations Table
CREATE TABLE
    designations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(100) NOT NULL,
        description TEXT,
        department_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments (id)
    );

-- Users Table
CREATE TABLE
    users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        role ENUM ('admin', 'staff', 'doctor', 'receptionist') NOT NULL,
        phone VARCHAR(20),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Doctors Table
CREATE TABLE
    doctors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        department_id INT,
        designation_id INT,
        specialization VARCHAR(100),
        qualification TEXT,
        experience_years INT,
        consultation_fee DECIMAL(10, 2),
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (department_id) REFERENCES departments (id),
        FOREIGN KEY (designation_id) REFERENCES designations (id)
    );

-- Doctor Specialization Table
CREATE TABLE
    doctor_specialization (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        specialization_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
    );

-- Doctor Schedule Table
CREATE TABLE
    doctor_schedule (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        day_of_week ENUM (
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        ) NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        max_patients INT DEFAULT 20,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
    );

-- Doctor Availability Table
CREATE TABLE
    doctor_availability (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        status ENUM ('available', 'unavailable', 'on_leave') DEFAULT 'available',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
        UNIQUE KEY unique_doctor_date_time (doctor_id, date, start_time)
    );

-- Doctor Leaves Table
CREATE TABLE
    doctor_leaves (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        leave_type ENUM ('sick', 'vacation', 'emergency', 'other') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status ENUM ('pending', 'approved', 'rejected') DEFAULT 'pending',
        approved_by INT,
        approved_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE,
        FOREIGN KEY (approved_by) REFERENCES users (id)
    );

-- Doctor Commission Table
CREATE TABLE
    doctor_commission (
        id INT PRIMARY KEY AUTO_INCREMENT,
        doctor_id INT NOT NULL,
        commission_type ENUM ('percentage', 'fixed') NOT NULL,
        commission_value DECIMAL(10, 2) NOT NULL,
        effective_from DATE NOT NULL,
        effective_to DATE,
        is_active BOOLEAN DEFAULT TRUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (doctor_id) REFERENCES doctors (id) ON DELETE CASCADE
    );

-- Patients Table
CREATE TABLE
    patients (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id VARCHAR(20) NOT NULL UNIQUE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        date_of_birth DATE,
        gender ENUM ('male', 'female', 'other'),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        blood_group VARCHAR(5),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Patient Visits Table (OPD/IPD)
CREATE TABLE
    patient_visits (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        visit_type ENUM ('OPD', 'IPD') NOT NULL,
        visit_date DATE NOT NULL,
        department_id INT,
        doctor_id INT,
        admission_date DATE,
        discharge_date DATE,
        status ENUM ('active', 'completed', 'cancelled') DEFAULT 'active',
        chief_complaints TEXT,
        diagnosis TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (department_id) REFERENCES departments (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id)
    );

-- Revenue/Billing Table
CREATE TABLE
    billing (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_visit_id INT,
        patient_id INT NOT NULL,
        bill_date DATE NOT NULL,
        bill_type ENUM ('OPD', 'IPD', 'Pharmacy', 'Laboratory', 'Other') NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        paid_amount DECIMAL(10, 2) DEFAULT 0,
        discount_amount DECIMAL(10, 2) DEFAULT 0,
        status ENUM ('pending', 'partial', 'paid', 'cancelled') DEFAULT 'pending',
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits (id),
        FOREIGN KEY (patient_id) REFERENCES patients (id)
    );

-- System Audit Logs Table
CREATE TABLE
    audit_logs (
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
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

-- System Status Table
CREATE TABLE
    system_status (
        id INT PRIMARY KEY AUTO_INCREMENT,
        service_name VARCHAR(100) NOT NULL UNIQUE,
        status ENUM ('operational', 'degraded', 'down', 'maintenance') DEFAULT 'operational',
        last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        response_time_ms INT,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Roles Table (for user management)
CREATE TABLE
    roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        permissions JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Permissions Table
CREATE TABLE
    permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- User Sessions Table
CREATE TABLE
    user_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        refresh_token VARCHAR(500) NOT NULL,
        expires_at DATETIME NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Password Reset Tokens Table
CREATE TABLE
    password_resets (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Activity Logs Table
CREATE TABLE
    activity_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT,
        action VARCHAR(100) NOT NULL,
        details JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
    );

-- Indexes for better performance
CREATE INDEX idx_doctors_department ON doctors (department_id);

CREATE INDEX idx_doctors_designation ON doctors (designation_id);

CREATE INDEX idx_schedule_doctor ON doctor_schedule (doctor_id);

CREATE INDEX idx_availability_doctor ON doctor_availability (doctor_id);

CREATE INDEX idx_availability_date ON doctor_availability (date);

CREATE INDEX idx_leaves_doctor ON doctor_leaves (doctor_id);

CREATE INDEX idx_leaves_dates ON doctor_leaves (start_date, end_date);

CREATE INDEX idx_commission_doctor ON doctor_commission (doctor_id);

CREATE INDEX idx_patients_id ON patients (patient_id);

CREATE INDEX idx_visits_patient ON patient_visits (patient_id);

CREATE INDEX idx_visits_date ON patient_visits (visit_date);

CREATE INDEX idx_visits_type ON patient_visits (visit_type);

CREATE INDEX idx_visits_department ON patient_visits (department_id);

CREATE INDEX idx_billing_patient ON billing (patient_id);

CREATE INDEX idx_billing_date ON billing (bill_date);

CREATE INDEX idx_billing_type ON billing (bill_type);

CREATE INDEX idx_audit_user ON audit_logs (user_id);

CREATE INDEX idx_audit_created ON audit_logs (created_at);

CREATE INDEX idx_audit_action ON audit_logs (action);

-- ABHA (Health ID) Table
CREATE TABLE
    patient_abha (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        health_id VARCHAR(50) NOT NULL UNIQUE,
        health_id_number VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        gender ENUM ('male', 'female', 'other') NOT NULL,
        year_of_birth INT NOT NULL,
        day_of_birth INT,
        month_of_birth INT,
        state VARCHAR(100),
        district VARCHAR(100),
        mobile VARCHAR(20),
        email VARCHAR(100),
        address TEXT,
        verification_status ENUM ('verified', 'pending', 'failed') DEFAULT 'pending',
        access_token TEXT,
        refresh_token TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE CASCADE,
        INDEX idx_health_id (health_id),
        INDEX idx_patient_abha (patient_id)
    );

-- PMJAY Claims Table
CREATE TABLE
    pmjay_claims (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT,
        card_number VARCHAR(50) NOT NULL,
        package_code VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        claim_id VARCHAR(100),
        status ENUM ('submitted', 'pending', 'approved', 'rejected', 'processed') DEFAULT 'submitted',
        submitted_at DATETIME,
        updated_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id) ON DELETE SET NULL,
        INDEX idx_card_number (card_number),
        INDEX idx_claim_id (claim_id),
        INDEX idx_status (status)
    );

-- IPD Admissions Table
CREATE TABLE
    ipd_admissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_id INT NOT NULL,
        patient_visit_id INT NOT NULL,
        admission_date DATE NOT NULL,
        discharge_date DATE,
        bed_number VARCHAR(20),
        ward VARCHAR(50),
        admission_type ENUM ('emergency', 'routine', 'referral') DEFAULT 'routine',
        status ENUM ('admitted', 'discharged', 'transferred', 'deceased') DEFAULT 'admitted',
        discharge_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits (id),
        INDEX idx_patient_ipd (patient_id),
        INDEX idx_admission_date (admission_date),
        INDEX idx_status_ipd (status)
    );

-- Prescriptions Table
CREATE TABLE
    prescriptions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_visit_id INT NOT NULL,
        doctor_id INT NOT NULL,
        prescription_date DATE NOT NULL,
        diagnosis TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits (id),
        FOREIGN KEY (doctor_id) REFERENCES doctors (id),
        INDEX idx_visit_prescription (patient_visit_id),
        INDEX idx_doctor_prescription (doctor_id),
        INDEX idx_prescription_date (prescription_date)
    );

-- Prescription Medicines Table
CREATE TABLE
    prescription_medicines (
        id INT PRIMARY KEY AUTO_INCREMENT,
        prescription_id INT NOT NULL,
        medicine_name VARCHAR(200) NOT NULL,
        dosage VARCHAR(100),
        frequency VARCHAR(100),
        duration VARCHAR(100),
        instructions TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prescription_id) REFERENCES prescriptions (id) ON DELETE CASCADE,
        INDEX idx_prescription_medicines (prescription_id)
    );

-- Investigations Table
CREATE TABLE
    investigations (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_visit_id INT NOT NULL,
        patient_id INT NOT NULL,
        investigation_name VARCHAR(200) NOT NULL,
        investigation_type VARCHAR(100),
        status ENUM ('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
        result TEXT,
        performed_by INT,
        performed_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits (id),
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (performed_by) REFERENCES users (id),
        INDEX idx_visit_investigation (patient_visit_id),
        INDEX idx_patient_investigation (patient_id),
        INDEX idx_investigation_status (status)
    );

-- Discharge Summaries Table
CREATE TABLE
    discharge_summaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        patient_visit_id INT NOT NULL,
        patient_id INT NOT NULL,
        discharge_date DATE NOT NULL,
        discharge_summary TEXT NOT NULL,
        diagnosis TEXT,
        treatment_given TEXT,
        medications_on_discharge TEXT,
        follow_up_instructions TEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (patient_visit_id) REFERENCES patient_visits (id),
        FOREIGN KEY (patient_id) REFERENCES patients (id),
        FOREIGN KEY (created_by) REFERENCES users (id),
        INDEX idx_visit_discharge (patient_visit_id),
        INDEX idx_patient_discharge (patient_id),
        INDEX idx_discharge_date (discharge_date)
    );

-- System Settings Table
CREATE TABLE
    system_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        setting_type ENUM ('string', 'number', 'boolean', 'json') DEFAULT 'string',
        description TEXT,
        updated_by INT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (updated_by) REFERENCES users (id) ON DELETE SET NULL,
        INDEX idx_setting_key (setting_key)
    );