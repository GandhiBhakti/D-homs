-- ABDM Integration Database Migration
-- This file creates the necessary tables for ABDM integration

-- Create patient_abha table to store ABHA (Health ID) information
CREATE TABLE IF NOT EXISTS patient_abha (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  health_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'ABHA Health ID',
  health_id_number VARCHAR(14) COMMENT '14-digit ABHA number',
  name VARCHAR(255) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  year_of_birth INT NOT NULL,
  day_of_birth INT,
  month_of_birth INT,
  state VARCHAR(100),
  district VARCHAR(100),
  mobile VARCHAR(15),
  email VARCHAR(255),
  address TEXT,
  verification_status ENUM('pending', 'verified', 'failed') DEFAULT 'pending',
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  access_token TEXT COMMENT 'ABDM access token',
  refresh_token TEXT COMMENT 'ABDM refresh token',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  INDEX idx_health_id (health_id),
  INDEX idx_patient_id (patient_id),
  INDEX idx_verification_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create care_context table for HIP services
CREATE TABLE IF NOT EXISTS care_context (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  patient_abha_id INT,
  context_id VARCHAR(100) NOT NULL UNIQUE COMMENT 'Care context ID from ABDM',
  context_name VARCHAR(255) NOT NULL COMMENT 'Name of the care context (e.g., OPD visit)',
  context_type ENUM('OPD', 'IPD', 'Diagnostic', 'Pharmacy', 'Other') DEFAULT 'OPD',
  visit_id INT COMMENT 'Reference to patient_visits table',
  facility_id VARCHAR(100) COMMENT 'Health facility ID from HFR',
  linked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL COMMENT 'When the care context link expires',
  status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_abha_id) REFERENCES patient_abha(id) ON DELETE SET NULL,
  INDEX idx_context_id (context_id),
  INDEX idx_patient_id (patient_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create consent_artefact table for consent management
CREATE TABLE IF NOT EXISTS consent_artefact (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  patient_abha_id INT,
  consent_request_id VARCHAR(100) NOT NULL,
  consent_artefact_id VARCHAR(100) NOT NULL,
  consent_manager_id VARCHAR(100) NOT NULL,
  hip_id VARCHAR(100) NOT NULL,
  hiu_id VARCHAR(100),
  purpose VARCHAR(255) COMMENT 'Purpose of data access',
  data_access_mode ENUM('view', 'download', 'stream') DEFAULT 'view',
  date_range JSON COMMENT 'Date range for data access',
  care_contexts JSON COMMENT 'List of care contexts included',
  status ENUM('requested', 'granted', 'denied', 'expired', 'revoked') DEFAULT 'requested',
  granted_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_abha_id) REFERENCES patient_abha(id) ON DELETE SET NULL,
  INDEX idx_consent_artefact_id (consent_artefact_id),
  INDEX idx_patient_id (patient_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create health_data_exchange table for tracking data transfers
CREATE TABLE IF NOT EXISTS health_data_exchange (
  id INT AUTO_INCREMENT PRIMARY KEY,
  consent_artefact_id INT NOT NULL,
  data_request_id VARCHAR(100) NOT NULL,
  data_transfer_id VARCHAR(100),
  hip_id VARCHAR(100) NOT NULL,
  hiu_id VARCHAR(100),
  data_bundle_url TEXT COMMENT 'URL to FHIR bundle',
  data_bundle_encrypted BOOLEAN DEFAULT TRUE,
  data_status ENUM('requested', 'transferred', 'failed', 'decrypted') DEFAULT 'requested',
  transferred_at TIMESTAMP NULL,
  decrypted_at TIMESTAMP NULL,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (consent_artefact_id) REFERENCES consent_artefact(id) ON DELETE CASCADE,
  INDEX idx_data_request_id (data_request_id),
  INDEX idx_data_transfer_id (data_transfer_id),
  INDEX idx_status (data_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create abdm_audit_log table for audit trail
CREATE TABLE IF NOT EXISTS abdm_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT,
  user_id INT,
  action VARCHAR(100) NOT NULL COMMENT 'Action performed (e.g., ABHA_LINK, CONSENT_REQUEST)',
  entity_type VARCHAR(50) COMMENT 'Type of entity (e.g., ABHA, CONSENT, CARE_CONTEXT)',
  entity_id VARCHAR(100) COMMENT 'ID of the entity',
  request_data JSON COMMENT 'Request payload',
  response_data JSON COMMENT 'Response payload',
  status ENUM('success', 'failure') DEFAULT 'success',
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_patient_id (patient_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
