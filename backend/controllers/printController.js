const db = require("../config/database");

// Get OPD slip data for printing
exports.getOPDSlip = async (req, res) => {
  try {
    const { visitId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        pv.id as visit_id,
        pv.visit_date,
        pv.visit_type,
        pv.chief_complaints,
        pv.diagnosis,
        pv.uhid,
        pv.age,
        pv.relative_name,
        pv.relative_mobile,
        pv.reference_doctor_id,
        pv.is_pmjay,
        pv.follow_up_date,
        p.first_name,
        p.last_name,
        p.gender,
        p.phone,
        p.address,
        p.blood_group,
        p.date_of_birth,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.qualification,
        d.specialization,
        dept.name as department_name,
        ref_doctor.first_name as ref_doctor_first_name,
        ref_doctor.last_name as ref_doctor_last_name
      FROM patient_visits pv
      LEFT JOIN patients p ON pv.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      LEFT JOIN departments dept ON pv.department_id = dept.id
      LEFT JOIN doctors ref_doctor ON pv.reference_doctor_id = ref_doctor.id
      WHERE pv.id = ?
    `, [visitId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "OPD visit not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get prescription data for printing
exports.getPrescription = async (req, res) => {
  try {
    const { visitId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        pv.id as visit_id,
        pv.visit_date,
        pv.chief_complaints,
        pv.diagnosis,
        pv.uhid,
        p.first_name,
        p.last_name,
        p.gender,
        p.age,
        p.phone,
        p.address,
        p.blood_group,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.qualification,
        d.specialization,
        d.registration_number,
        dept.name as department_name,
        pres.*,
        pres.medicine_name,
        pres.dosage,
        pres.frequency,
        pres.duration,
        pres.instructions
      FROM patient_visits pv
      LEFT JOIN patients p ON pv.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      LEFT JOIN departments dept ON pv.department_id = dept.id
      LEFT JOIN prescriptions pres ON pv.id = pres.patient_visit_id
      WHERE pv.id = ?
    `, [visitId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get investigation data for printing
exports.getInvestigationPrint = async (req, res) => {
  try {
    const { investigationId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        i.*,
        pv.visit_date,
        pv.uhid,
        p.first_name,
        p.last_name,
        p.gender,
        p.age,
        p.phone,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.qualification,
        d.specialization
      FROM investigations i
      LEFT JOIN patient_visits pv ON i.patient_visit_id = pv.id
      LEFT JOIN patients p ON i.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      WHERE i.id = ?
    `, [investigationId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Investigation not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get billing data for printing
exports.getBillingPrint = async (req, res) => {
  try {
    const { billId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        b.*,
        pv.visit_date,
        pv.uhid,
        pv.visit_type,
        p.first_name,
        p.last_name,
        p.gender,
        p.age,
        p.phone,
        p.address,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.qualification,
        d.specialization
      FROM billing b
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      WHERE b.id = ?
    `, [billId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get payment receipt data for printing
exports.getPaymentReceipt = async (req, res) => {
  try {
    const { billId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        b.*,
        pv.visit_date,
        pv.uhid,
        p.first_name,
        p.last_name,
        p.phone,
        p.address,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name
      FROM billing b
      LEFT JOIN patient_visits pv ON b.patient_visit_id = pv.id
      LEFT JOIN patients p ON b.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      WHERE b.id = ?
    `, [billId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Bill not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get UHID label data for printing
exports.getUHIDLabel = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        p.id,
        p.uhid,
        p.first_name,
        p.last_name,
        p.gender,
        p.date_of_birth,
        p.phone,
        p.blood_group
      FROM patients p
      WHERE p.id = ?
    `, [patientId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discharge summary data for printing
exports.getDischargeSummaryPrint = async (req, res) => {
  try {
    const { summaryId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        ds.*,
        pv.visit_date,
        pv.admission_date_time,
        pv.ward,
        pv.room,
        pv.bed,
        pv.uhid,
        p.first_name,
        p.last_name,
        p.gender,
        p.age,
        p.phone,
        p.address,
        p.blood_group,
        p.date_of_birth,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.qualification,
        d.specialization,
        d.registration_number,
        dept.name as department_name
      FROM discharge_summaries ds
      LEFT JOIN patient_visits pv ON ds.patient_visit_id = pv.id
      LEFT JOIN patients p ON ds.patient_id = p.id
      LEFT JOIN doctors d ON pv.doctor_id = d.id
      LEFT JOIN departments dept ON pv.department_id = dept.id
      WHERE ds.id = ?
    `, [summaryId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Discharge summary not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sticker data for file printing
exports.getFileSticker = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const [rows] = await db.execute(`
      SELECT 
        p.id,
        p.uhid,
        p.first_name,
        p.last_name,
        p.gender,
        p.date_of_birth,
        p.phone,
        p.address,
        p.blood_group,
        (SELECT COUNT(*) FROM patient_visits WHERE patient_id = p.id) as total_visits,
        (SELECT MAX(visit_date) FROM patient_visits WHERE patient_id = p.id) as last_visit_date
      FROM patients p
      WHERE p.id = ?
    `, [patientId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
