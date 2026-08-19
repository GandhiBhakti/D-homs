const db = require("../config/database");
const PatientVisit = require("../models/PatientVisit");
const Department = require("../models/Department");
const Doctor = require("../models/Doctor");

// Get all IPD visits/admissions
exports.getIPDVisits = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT pv.id, pv.visit_date, pv.admission_date, pv.discharge_date, pv.status, 
             pv.chief_complaints, pv.diagnosis, pv.notes,
             p.first_name, p.last_name, p.phone, p.email, p.patient_id,
             d.name AS department_name,
             dr.first_name AS doctor_first_name, dr.last_name AS doctor_last_name
      FROM patient_visits pv
      LEFT JOIN patients p ON p.id = pv.patient_id
      LEFT JOIN departments d ON d.id = pv.department_id
      LEFT JOIN doctors dr ON dr.id = pv.doctor_id
      WHERE pv.visit_type = 'IPD'
      ORDER BY pv.admission_date DESC, pv.id DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get active IPD patients (currently admitted)
exports.getActiveIPD = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT pv.id, pv.admission_date, pv.chief_complaints, pv.diagnosis,
             p.first_name, p.last_name, p.phone, p.patient_id, p.age,
             d.name AS department_name,
             dr.first_name AS doctor_first_name, dr.last_name AS doctor_last_name,
             dr.consultation_fee,
             DATEDIFF(CURDATE(), pv.admission_date) as days_admitted
      FROM patient_visits pv
      LEFT JOIN patients p ON p.id = pv.patient_id
      LEFT JOIN departments d ON d.id = pv.department_id
      LEFT JOIN doctors dr ON dr.id = pv.doctor_id
      WHERE pv.visit_type = 'IPD' AND pv.status = 'active'
      ORDER BY pv.admission_date DESC
    `);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new IPD admission
exports.createIPDAdmission = async (req, res) => {
  try {
    const {
      patient_first_name,
      patient_last_name,
      gender,
      phone,
      email,
      date_of_birth,
      address,
      blood_group,
      department_id,
      doctor_id,
      admission_date,
      chief_complaints,
      diagnosis,
      notes,
    } = req.body;

    if (!patient_first_name || !patient_last_name || !phone) {
      return res.status(400).json({
        error: "Patient first name, last name, and phone are required",
      });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      let patient = null;
      if (email || phone) {
        patient = await PatientVisit.findPatientByEmailOrPhone(
          connection,
          email,
          phone,
        );
      }

      if (!patient) {
        patient = await PatientVisit.createPatient(connection, {
          first_name: patient_first_name,
          last_name: patient_last_name,
          date_of_birth: date_of_birth || null,
          gender: gender || null,
          phone,
          email: email || null,
          address: address || null,
          blood_group: blood_group || null,
        });
      }

      let selectedDepartmentId = department_id ? Number(department_id) : null;
      let selectedDoctorId = doctor_id ? Number(doctor_id) : null;

      if (selectedDepartmentId) {
        const department = await Department.findById(selectedDepartmentId);
        if (!department) {
          return res
            .status(400)
            .json({ error: "Selected department not found" });
        }
      }

      if (selectedDoctorId) {
        const doctor = await Doctor.findById(selectedDoctorId);
        if (!doctor) {
          return res.status(400).json({ error: "Selected doctor not found" });
        }

        if (!selectedDepartmentId && doctor.department_id) {
          selectedDepartmentId = doctor.department_id;
        }

        if (
          selectedDepartmentId &&
          doctor.department_id &&
          doctor.department_id !== selectedDepartmentId
        ) {
          return res.status(400).json({
            error: "Selected doctor does not belong to the selected department",
          });
        }
      }

      const visit = await PatientVisit.createVisit(connection, {
        patient_id: patient.id,
        visit_type: "IPD",
        visit_date: admission_date || new Date().toISOString().slice(0, 10),
        admission_date: admission_date || new Date().toISOString().slice(0, 10),
        department_id: selectedDepartmentId,
        doctor_id: selectedDoctorId,
        status: "active",
        chief_complaints: chief_complaints || null,
        diagnosis: diagnosis || null,
        notes: notes || null,
      });

      await connection.commit();

      res.status(201).json({
        message: "IPD admission created successfully",
        visit,
        patient,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Discharge IPD patient
exports.dischargeIPDPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { discharge_date, discharge_notes, final_diagnosis } = req.body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `UPDATE patient_visits 
         SET discharge_date = ?, 
             status = 'completed',
             notes = CONCAT(COALESCE(notes, ''), '\nDischarge: ', ?),
             diagnosis = COALESCE(?, diagnosis)
         WHERE id = ? AND visit_type = 'IPD'`,
        [
          discharge_date || new Date().toISOString().slice(0, 10),
          discharge_notes || '',
          final_diagnosis || null,
          id,
        ]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "IPD visit not found" });
      }

      await connection.commit();

      res.json({ message: "Patient discharged successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get IPD statistics
exports.getIPDStatistics = async (req, res) => {
  try {
    const connection = await db.getConnection();

    // Total admissions today
    const [admissionsToday] = await connection.query(
      'SELECT COUNT(*) as count FROM patient_visits WHERE visit_type = "IPD" AND DATE(admission_date) = CURDATE()'
    );

    // Total discharges today
    const [dischargesToday] = await connection.query(
      'SELECT COUNT(*) as count FROM patient_visits WHERE visit_type = "IPD" AND DATE(discharge_date) = CURDATE()'
    );

    // Currently admitted patients
    const [currentlyAdmitted] = await connection.query(
      'SELECT COUNT(*) as count FROM patient_visits WHERE visit_type = "IPD" AND status = "active"'
    );

    // Average length of stay (completed admissions in last 30 days)
    const [avgStay] = await connection.query(`
      SELECT AVG(DATEDIFF(discharge_date, admission_date)) as avg_days
      FROM patient_visits
      WHERE visit_type = 'IPD' 
        AND status = 'completed'
        AND discharge_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    `);

    connection.release();

    res.json({
      admissionsToday: admissionsToday[0].count,
      dischargesToday: dischargesToday[0].count,
      currentlyAdmitted: currentlyAdmitted[0].count,
      averageStayDays: parseFloat(avgStay[0].avg_days) || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
