const db = require("../config/database");
const PatientVisit = require("../models/PatientVisit");
const Department = require("../models/Department");
const Doctor = require("../models/Doctor");

exports.getOPDVisits = async (req, res) => {
  try {
    let query = `
      SELECT pv.id, pv.visit_date, pv.status, pv.chief_complaints, pv.diagnosis, pv.notes,
             p.first_name, p.last_name, p.phone, p.email,
             d.name AS department_name,
             dr.first_name AS doctor_first_name, dr.last_name AS doctor_last_name, dr.id AS doctor_id
      FROM patient_visits pv
      LEFT JOIN patients p ON p.id = pv.patient_id
      LEFT JOIN departments d ON d.id = pv.department_id
      LEFT JOIN doctors dr ON dr.id = pv.doctor_id
      WHERE pv.visit_type = 'OPD'
    `;
    const params = [];

    if (req.user && req.user.role === 'doctor') {
      query += ` AND pv.doctor_id = ?`;
      params.push(req.user.doctor_id);
    } else if (req.user && req.user.role === 'staff') {
      // Staff can see all OPD visits (no filtering)
    }

    query += ` ORDER BY pv.visit_date DESC, pv.id DESC`;

    const [rows] = await db.execute(query, params);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const [rows] = await db.execute(`
      SELECT DISTINCT p.id, p.first_name, p.last_name, p.phone, p.email, 
             p.gender, p.date_of_birth, p.address, p.blood_group
      FROM patients p
      INNER JOIN patient_visits pv ON p.id = pv.patient_id
      WHERE pv.doctor_id = ? AND pv.visit_type = 'OPD'
      ORDER BY p.first_name, p.last_name
    `, [doctorId]);

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOPDVisit = async (req, res) => {
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
      visit_date,
      chief_complaints,
      diagnosis,
      notes,
      uhid,
      age,
      relative_name,
      relative_mobile,
      reference_doctor_id,
      is_pmjay,
      is_plastic_surgery,
      admission_advice,
      follow_up_date,
      injection_advice,
      plaster_advice,
      dressing_advice,
      operation_advice,
      physiotherapy_advice,
      pmjay_advice,
      non_pmjay_advice,
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
        visit_type: "OPD",
        visit_date: visit_date || new Date().toISOString().slice(0, 10),
        department_id: selectedDepartmentId,
        doctor_id: selectedDoctorId,
        status: "active",
        chief_complaints: chief_complaints || null,
        diagnosis: diagnosis || null,
        notes: notes || null,
        uhid,
        age,
        relative_name,
        relative_mobile,
        reference_doctor_id,
        is_pmjay,
        is_plastic_surgery,
        admission_advice,
        follow_up_date,
        injection_advice,
        plaster_advice,
        dressing_advice,
        operation_advice,
        physiotherapy_advice,
        pmjay_advice,
        non_pmjay_advice,
      });

      await connection.commit();

      res.status(201).json({
        message: "OPD visit saved successfully",
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

exports.convertOPDtoIPD = async (req, res) => {
  try {
    const { opdVisitId, ward, room, bed, floor, admission_date_time } = req.body;

    if (!opdVisitId) {
      return res.status(400).json({ error: "OPD visit ID is required" });
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Get OPD visit details
      const [opdVisits] = await connection.execute(
        'SELECT * FROM patient_visits WHERE id = ? AND visit_type = "OPD"',
        [opdVisitId]
      );

      if (opdVisits.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: "OPD visit not found" });
      }

      const opdVisit = opdVisits[0];

      // Create new IPD visit with all OPD data
      const ipdVisit = await PatientVisit.createVisit(connection, {
        patient_id: opdVisit.patient_id,
        visit_type: "IPD",
        visit_date: new Date().toISOString().slice(0, 10),
        department_id: opdVisit.department_id,
        doctor_id: opdVisit.doctor_id,
        status: "active",
        chief_complaints: opdVisit.chief_complaints,
        diagnosis: opdVisit.diagnosis,
        notes: opdVisit.notes,
        uhid: opdVisit.uhid,
        age: opdVisit.age,
        relative_name: opdVisit.relative_name,
        relative_mobile: opdVisit.relative_mobile,
        reference_doctor_id: opdVisit.reference_doctor_id,
        is_pmjay: opdVisit.is_pmjay,
        is_plastic_surgery: opdVisit.is_plastic_surgery,
        admission_advice: opdVisit.admission_advice,
        follow_up_date: opdVisit.follow_up_date,
        injection_advice: opdVisit.injection_advice,
        plaster_advice: opdVisit.plaster_advice,
        dressing_advice: opdVisit.dressing_advice,
        operation_advice: opdVisit.operation_advice,
        physiotherapy_advice: opdVisit.physiotherapy_advice,
        pmjay_advice: opdVisit.pmjay_advice,
        non_pmjay_advice: opdVisit.non_pmjay_advice,
        ward,
        room,
        bed,
        floor,
        admission_date_time: admission_date_time || new Date().toISOString().slice(0, 19).replace('T', ' '),
      });

      // Update OPD visit status to completed
      await connection.execute(
        'UPDATE patient_visits SET status = "completed" WHERE id = ?',
        [opdVisitId]
      );

      await connection.commit();

      res.status(201).json({
        message: "OPD visit converted to IPD successfully",
        ipdVisit,
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
