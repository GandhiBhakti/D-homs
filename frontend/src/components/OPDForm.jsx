import React, { useState, useEffect } from "react";
import { doctorService } from "../services/doctorService";
import { opdService } from "../services/opdService";
import { useAuth } from "../contexts/AuthContext";
import API_BASE_URL from "../config/api";
import Toast from "./Toast";
import PatientSavedModal from "./PatientSavedModal";
import ABHAVerification from "./ABHAVerification";
import PMJAYVerification from "./PMJAYVerification";
import "./OPDForm.css";

function OPDForm({ onOPDVisitSaved, defaultService = "opd" }) {
  const { user, isDoctor, isStaff } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedPatient, setSavedPatient] = useState(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [patientType, setPatientType] = useState("new");
  const [doctorPatients, setDoctorPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [showABHAVerification, setShowABHAVerification] = useState(false);
  const [showPMJAYVerification, setShowPMJAYVerification] = useState(false);
  const [formData, setFormData] = useState({
    patient_first_name: "",
    patient_last_name: "",
    gender: "male",
    phone: "",
    email: "",
    date_of_birth: "",
    address: "",
    blood_group: "",
    department_id: "",
    doctor_id: "",
    visit_date: new Date().toISOString().slice(0, 10),
    chief_complaints: "",
    diagnosis: "",
    notes: "",
    uhid: "",
    age: "",
    relative_name: "",
    relative_mobile: "",
    reference_doctor_id: "",
    is_pmjay: false,
    is_plastic_surgery: false,
    admission_advice: false,
    follow_up_date: "",
    injection_advice: false,
    plaster_advice: false,
    dressing_advice: false,
    operation_advice: false,
    physiotherapy_advice: false,
    pmjay_advice: "",
    non_pmjay_advice: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const doctorData = await doctorService.getAllDoctors();
        setDoctors(doctorData);

        // If user is a doctor, auto-select their doctor ID
        if (isDoctor() && user?.doctor_id) {
          const userDoctor = doctorData.find((d) => d.id === user.doctor_id);
          if (userDoctor) {
            setSelectedDoctorId(userDoctor.id);
            setFormData((prev) => ({
              ...prev,
              doctor_id: userDoctor.id,
              department_id: userDoctor.department_id || prev.department_id,
            }));

            // Fetch patients for this doctor
            try {
              const response = await fetch(
                `${API_BASE_URL}/opd/doctor/${userDoctor.id}/patients`,
              );
              if (response.ok) {
                const patients = await response.json();
                setDoctorPatients(patients);
              }
            } catch (err) {
              console.error("Error fetching doctor's patients:", err);
            }
          }
        }
        // Staff can select any doctor, no auto-selection needed
      } catch (err) {
        setError("Unable to load departments or doctors");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isDoctor, isStaff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectedDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(selectedDoctorId),
  );

  const handleDoctorSelect = async (doctor) => {
    setSelectedDoctorId(doctor.id);
    setFormData((prev) => ({
      ...prev,
      doctor_id: doctor.id,
      department_id: doctor.department_id || prev.department_id,
    }));

    // Fetch patients for this doctor
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE_URL}/opd/doctor/${doctor.id}/patients`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.ok) {
        const patients = await response.json();
        setDoctorPatients(patients);
      }
    } catch (err) {
      console.error("Error fetching doctor's patients:", err);
      setDoctorPatients([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientType("existing");
    setFormData((prev) => ({
      ...prev,
      patient_first_name: patient.first_name || "",
      patient_last_name: patient.last_name || "",
      gender: patient.gender || "male",
      phone: patient.phone || "",
      email: patient.email || "",
      date_of_birth: patient.date_of_birth || "",
      address: patient.address || "",
      blood_group: patient.blood_group || "",
    }));
  };

  const handleNewPatient = () => {
    setSelectedPatient(null);
    setPatientType("new");
    setFormData((prev) => ({
      ...prev,
      patient_first_name: "",
      patient_last_name: "",
      gender: "male",
      phone: "",
      email: "",
      date_of_birth: "",
      address: "",
      blood_group: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!selectedDoctorId) {
      setError("Please select a doctor before saving the OPD visit.");
      return;
    }

    try {
      const result = await opdService.createOPDVisit(formData);
      const patientName =
        `${formData.patient_first_name || ""} ${formData.patient_last_name || ""}`.trim() ||
        "New patient";
      setSavedPatient({
        title: "OPD registration saved",
        subtitle: "The patient record is now available in the OPD list.",
        patientName,
        details: [
          {
            label: "Doctor",
            value:
              selectedDoctor?.full_name ||
              selectedDoctor?.first_name ||
              "Selected doctor",
          },
          { label: "Phone", value: formData.phone || "-" },
          {
            label: "Visit date",
            value: formData.visit_date || new Date().toISOString().slice(0, 10),
          },
          {
            label: "Patient ID",
            value: result.visit?.id ? `OPD-${result.visit.id}` : "Generated",
          },
        ],
      });
      setShowSavedModal(true);
      setToast({ message: "OPD visit saved successfully!", type: "success" });
      setMessage(
        `OPD visit saved successfully! Patient ID: ${result.patient_id || "Generated"}`,
      );
      setFormData((prev) => ({
        ...prev,
        patient_first_name: "",
        patient_last_name: "",
        gender: "male",
        phone: "",
        email: "",
        date_of_birth: "",
        address: "",
        blood_group: "",
        department_id: "",
        doctor_id: "",
        visit_date: new Date().toISOString().slice(0, 10),
        chief_complaints: "",
        diagnosis: "",
        notes: "",
      }));
      setSelectedDoctorId("");
      setPatientType("new");
      setSelectedPatient(null);
      setDoctorPatients([]);
      onOPDVisitSaved?.();
    } catch (err) {
      setError(err.message);
      setToast({
        message: err.message || "Failed to save OPD visit",
        type: "error",
      });
    }
  };

  if (loading) {
    return <div className="loading">Loading OPD form...</div>;
  }

  return (
    <div className="opd-form-page">
      <div className="page-header">
        <div>
          <h2>OPD Registration</h2>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form onSubmit={handleSubmit}>
        <div className="opd-step-card">
          <div className="panel-header">
            <span className="panel-badge">STEP 1</span>
            <h3>Select Doctor</h3>
            <p>Choose the attending physician for this consultation.</p>
          </div>

          <div className="doctor-list">
            {doctors.map((doctor) => {
              const fullName =
                `${doctor.first_name || ""} ${doctor.last_name || ""}`.trim();
              const initials =
                `${doctor.first_name?.[0] || "D"}${doctor.last_name?.[0] || ""}`.toUpperCase();
              const isSelected = String(doctor.id) === String(selectedDoctorId);

              return (
                <div
                  key={doctor.id}
                  className={`doctor-card ${isSelected ? "doctor-card-active" : ""}`}
                >
                  <div className="doctor-avatar">{initials}</div>
                  <div className="doctor-body">
                    <div className="doctor-name-row">
                      <strong>{fullName || "Doctor"}</strong>
                    </div>
                    <p className="doctor-specialty">
                      {doctor.specialization ||
                        doctor.department_name ||
                        "Specialist"}
                    </p>
                    <p className="doctor-qualification">
                      {doctor.qualification || "General Physician"}
                    </p>
                    <div className="doctor-meta">
                      <span>Exp: {doctor.experience_years || 0} yrs</span>
                      <span>Fee: ₹{doctor.consultation_fee || 0}</span>
                    </div>
                    <button
                      type="button"
                      className={`select-doctor-btn ${isSelected ? "selected" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoctorSelect(doctor);
                      }}
                    >
                      {isSelected ? <>✓ Selected</> : "Select"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="opd-step-card">
          <div className="panel-header">
            <span className="panel-badge">STEP 2</span>
            <h3>Select Patient Type</h3>
            <p>Choose whether this is an old patient or a new patient.</p>
          </div>

          <div className="patient-type-toggle">
            <label
              className={`radio-button ${patientType === "existing" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="patientType"
                value="existing"
                checked={patientType === "existing"}
                onChange={() => setPatientType("existing")}
              />
              <span className="radio-label">Old Patient</span>
            </label>
            <label
              className={`radio-button ${patientType === "new" ? "active" : ""}`}
            >
              <input
                type="radio"
                name="patientType"
                value="new"
                checked={patientType === "new"}
                onChange={handleNewPatient}
              />
              <span className="radio-label">New Patient</span>
            </label>
          </div>

          {patientType === "existing" && (
            <div className="patient-list-section">
              <div className="patient-search">
                <input
                  type="text"
                  placeholder="Search patients by name or phone..."
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                  className="patient-search-input"
                />
              </div>
              {selectedDoctor && doctorPatients.length > 0 ? (
                <div className="patient-grid">
                  {doctorPatients
                    .filter((patient) => {
                      const keyword = patientSearchQuery.toLowerCase();
                      const fullName =
                        `${patient.first_name || ""} ${patient.last_name || ""}`.toLowerCase();
                      return (
                        fullName.includes(keyword) ||
                        (patient.phone || "").includes(keyword)
                      );
                    })
                    .map((patient) => {
                      const isSelected = selectedPatient?.id === patient.id;
                      const fullName =
                        `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
                      const initials =
                        `${patient.first_name?.[0] || "P"}${patient.last_name?.[0] || ""}`.toUpperCase();

                      return (
                        <button
                          key={patient.id}
                          type="button"
                          className={`patient-card ${isSelected ? "patient-card-active" : ""}`}
                          onClick={() => handlePatientSelect(patient)}
                        >
                          <div className="patient-avatar">{initials}</div>
                          <div className="patient-body">
                            <div className="patient-name-row">
                              <strong>{fullName || "Patient"}</strong>
                              {isSelected && (
                                <span className="patient-chip">Selected</span>
                              )}
                            </div>
                            <p className="patient-phone">
                              {patient.phone || "No phone"}
                            </p>
                            <p className="patient-gender">
                              {patient.gender || "Not specified"}
                            </p>
                            <div className="patient-meta">
                              <span>
                                Age:{" "}
                                {patient.date_of_birth
                                  ? new Date().getFullYear() -
                                    new Date(
                                      patient.date_of_birth,
                                    ).getFullYear()
                                  : "N/A"}
                              </span>
                              <span>Blood: {patient.blood_group || "N/A"}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  {doctorPatients.filter((patient) => {
                    const keyword = patientSearchQuery.toLowerCase();
                    const fullName =
                      `${patient.first_name || ""} ${patient.last_name || ""}`.toLowerCase();
                    return (
                      fullName.includes(keyword) ||
                      (patient.phone || "").includes(keyword)
                    );
                  }).length === 0 && (
                    <div className="no-patients-message">
                      <p>No patients match your search.</p>
                    </div>
                  )}
                </div>
              ) : selectedDoctor ? (
                <div className="no-patients-message">
                  <p>No existing patients found for this doctor.</p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleNewPatient}
                  >
                    Register New Patient
                  </button>
                </div>
              ) : (
                <div className="no-patients-message">
                  <p>
                    Please select a doctor first to search for existing
                    patients.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="opd-step-card">
          <div className="panel-header">
            <span className="panel-badge">STEP 3</span>
            <h3>Patient Registration</h3>
            <p>Capture patient details and confirm the OPD visit summary.</p>
          </div>

          <div className="patient-layout">
            <div className="patient-details">
              <div className="section-card">
                <div className="section-title">Patient Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>UHID</label>
                    <input
                      name="uhid"
                      value={formData.uhid}
                      onChange={handleChange}
                      placeholder="Enter UHID"
                    />
                  </div>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      name="patient_first_name"
                      value={formData.patient_first_name}
                      onChange={handleChange}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter age"
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Relative Name</label>
                    <input
                      name="relative_name"
                      value={formData.relative_name}
                      onChange={handleChange}
                      placeholder="Enter relative name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Relative Mobile</label>
                    <input
                      name="relative_mobile"
                      value={formData.relative_mobile}
                      onChange={handleChange}
                      placeholder="Enter relative mobile"
                    />
                  </div>

                  <div className="form-group">
                    <label>Reference Doctor</label>
                    <select
                      name="reference_doctor_id"
                      value={formData.reference_doctor_id}
                      onChange={handleChange}
                    >
                      <option value="">Select Reference Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Group</label>
                    <input
                      name="blood_group"
                      value={formData.blood_group}
                      onChange={handleChange}
                      placeholder="e.g. O+"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address</label>
                    <input
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">Visit Details</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Visit Date</label>
                    <input
                      type="date"
                      name="visit_date"
                      value={formData.visit_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      name="follow_up_date"
                      value={formData.follow_up_date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Chief Complaints</label>
                    <textarea
                      name="chief_complaints"
                      value={formData.chief_complaints}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Describe symptoms"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Diagnosis</label>
                    <textarea
                      name="diagnosis"
                      value={formData.diagnosis}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Add diagnosis"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="4"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">Additional Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_pmjay"
                        checked={formData.is_pmjay}
                        onChange={handleChange}
                      />
                      PMJAY Patient
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="is_plastic_surgery"
                        checked={formData.is_plastic_surgery}
                        onChange={handleChange}
                      />
                      Plastic Surgery
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="admission_advice"
                        checked={formData.admission_advice}
                        onChange={handleChange}
                      />
                      Admission Advice
                    </label>
                  </div>
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">Advice Section</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="injection_advice"
                        checked={formData.injection_advice}
                        onChange={handleChange}
                      />
                      Injection
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="plaster_advice"
                        checked={formData.plaster_advice}
                        onChange={handleChange}
                      />
                      Plaster
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="dressing_advice"
                        checked={formData.dressing_advice}
                        onChange={handleChange}
                      />
                      Dressing
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="operation_advice"
                        checked={formData.operation_advice}
                        onChange={handleChange}
                      />
                      Operation Advice
                    </label>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="physiotherapy_advice"
                        checked={formData.physiotherapy_advice}
                        onChange={handleChange}
                      />
                      Physiotherapy
                    </label>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>PMJAY Advice</label>
                  <textarea
                    name="pmjay_advice"
                    value={formData.pmjay_advice}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter PMJAY-specific advice"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Non-PMJAY Advice</label>
                  <textarea
                    name="non_pmjay_advice"
                    value={formData.non_pmjay_advice}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Enter non-PMJAY advice"
                  />
                </div>
              </div>
            </div>

            <aside className="summary-card">
              <h4>OPD Visit Summary</h4>
              <div className="summary-row">
                <span>Doctor</span>
                <strong>
                  {selectedDoctor
                    ? `${selectedDoctor.first_name} ${selectedDoctor.last_name}`.trim()
                    : "Select a doctor"}
                </strong>
              </div>
              <div className="summary-row">
                <span>Date</span>
                <strong>{formData.visit_date || "—"}</strong>
              </div>
              <div className="summary-row">
                <span>Consultation Fee</span>
                <strong>
                  {selectedDoctor?.consultation_fee
                    ? `₹${selectedDoctor.consultation_fee}`
                    : "—"}
                </strong>
              </div>
              <div className="summary-row">
                <span>Patient Type</span>
                <strong>
                  {patientType === "new" ? "New Patient" : "Existing Patient"}
                </strong>
              </div>
            </aside>

            <div className="form-actions full-width">
              <button type="button" className="btn btn-secondary" onClick={() => setShowABHAVerification(true)}>
                Verify ABHA
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowPMJAYVerification(true)}>
                Verify PMJAY
              </button>
              <button type="submit" className="btn btn-primary">
                Save OPD Visit
              </button>
            </div>
          </div>
        </div>
      </form>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <PatientSavedModal
        isOpen={showSavedModal}
        title={savedPatient?.title || "Saved successfully"}
        subtitle={
          savedPatient?.subtitle || "The patient record is ready to use."
        }
        patientName={savedPatient?.patientName || "Patient"}
        details={savedPatient?.details || []}
        onClose={() => setShowSavedModal(false)}
        onViewList={() => {
          setShowSavedModal(false);
          window.location.href = "/opd/list";
        }}
      />
      {showABHAVerification && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowABHAVerification(false)}>×</button>
            <ABHAVerification
              onABHALinked={(data) => {
                console.log('ABHA linked:', data);
                setShowABHAVerification(false);
              }}
              patientData={formData}
            />
          </div>
        </div>
      )}
      {showPMJAYVerification && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowPMJAYVerification(false)}>×</button>
            <PMJAYVerification
              onPMJAYLinked={(data) => {
                console.log('PMJAY linked:', data);
                setShowPMJAYVerification(false);
              }}
              patientData={formData}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default OPDForm;
