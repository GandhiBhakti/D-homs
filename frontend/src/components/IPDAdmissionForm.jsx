import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./IPDAdmissionForm.css";

function IPDAdmissionForm() {
  const [formData, setFormData] = useState({
    patient_id: "",
    admission_date: new Date().toISOString().split("T")[0],
    admission_time: new Date().toTimeString().slice(0, 5),
    department_id: "",
    doctor_id: "",
    bed_id: "",
    admission_type: "emergency",
    payment_mode: "cash",
    insurance_details: "",
    emergency_contact: "",
    emergency_phone: "",
    chief_complaints: "",
    diagnosis: "",
    notes: "",
    patient_first_name: "",
    patient_last_name: "",
    gender: "male",
    phone: "",
    email: "",
    date_of_birth: "",
    address: "",
    blood_group: "",
  });

  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [patientType, setPatientType] = useState("new");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [departmentsRes, doctorsRes, bedsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/departments`),
        fetch(`${API_BASE_URL}/doctors`),
        fetch(`${API_BASE_URL}/beds/available`),
      ]);
      const [depts, docs, beds] = await Promise.all([
        departmentsRes.json(),
        doctorsRes.json(),
        bedsRes.json(),
      ]);
      setDepartments(Array.isArray(depts) ? depts : []);
      setDoctors(Array.isArray(docs) ? docs : []);
      setBeds(Array.isArray(beds) ? beds : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load initial data");
      setDepartments([]);
      setDoctors([]);
      setBeds([]);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setPatientType("existing");
    setFormData((prev) => ({
      ...prev,
      patient_id: patient.id,
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
      patient_id: "",
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
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/ipd/admit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Admission failed");

      setMessage("Patient admitted successfully!");
      setFormData({
        patient_id: "",
        admission_date: new Date().toISOString().split("T")[0],
        admission_time: new Date().toTimeString().slice(0, 5),
        department_id: "",
        doctor_id: "",
        bed_id: "",
        admission_type: "emergency",
        payment_mode: "cash",
        insurance_details: "",
        emergency_contact: "",
        emergency_phone: "",
        chief_complaints: "",
        diagnosis: "",
        notes: "",
        patient_first_name: "",
        patient_last_name: "",
        gender: "male",
        phone: "",
        email: "",
        date_of_birth: "",
        address: "",
        blood_group: "",
      });
      setSelectedPatient(null);
      setPatientType("existing");
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePatientSearch = async (q) => {
    setPatientSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/patients/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch { setSearchResults([]); } finally { setSearchLoading(false); }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="ipd-admission-form">
      <div className="ipd-form-header">
        <h2>Patient Admission</h2>
        <p>Admit a new patient to the hospital</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form className="ipd-form" onSubmit={handleSubmit}>
        <div className="ipd-form-section">
          <h3>Patient Information</h3>
          
          <div className="patient-type-toggle">
            <label className={`radio-button ${patientType === "existing" ? "active" : ""}`}>
              <input
                type="radio"
                name="patientType"
                value="existing"
                checked={patientType === "existing"}
                onChange={() => { setPatientType("existing"); setSearchResults([]); setPatientSearchQuery(""); }}
              />
              <span className="radio-label">Old Patient</span>
            </label>
            <label className={`radio-button ${patientType === "new" ? "active" : ""}`}>
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

          {patientType === "existing" ? (
            <div className="patient-list-section">
              <div className="patient-search">
                <input
                  type="text"
                  placeholder="Search by name, phone, or patient ID..."
                  value={patientSearchQuery}
                  onChange={(e) => handlePatientSearch(e.target.value)}
                  className="patient-search-input"
                />
              </div>
              {searchLoading && <p style={{padding:"8px"}}>Searching...</p>}
              {!searchLoading && patientSearchQuery.length >= 2 && (
                searchResults.length > 0 ? (
                  <div className="patient-grid">
                    {searchResults.map((patient) => {
                      const isSelected = selectedPatient?.id === patient.id;
                      const fullName = `${patient.first_name || ""} ${patient.last_name || ""}`.trim();
                      const initials = `${patient.first_name?.[0] || "P"}${patient.last_name?.[0] || ""}`.toUpperCase();
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
                              {isSelected && <span className="patient-chip">Selected</span>}
                            </div>
                            <p className="patient-phone">{patient.patient_id} | {patient.phone || "No phone"}</p>
                            <p className="patient-gender">{patient.gender || "Not specified"}</p>
                            <div className="patient-meta">
                              <span>Age: {patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : "N/A"}</span>
                              <span>Blood: {patient.blood_group || "N/A"}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-patients-message">
                    <p>No patients found. Try a different search or register as new patient.</p>
                  </div>
                )
              )}
              {patientSearchQuery.length < 2 && <p style={{padding:"8px",color:"#888"}}>Type at least 2 characters to search.</p>}
            </div>
          ) : (
            <div className="new-patient-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="patient_first_name"
                    value={formData.patient_first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="patient_last_name"
                    value={formData.patient_last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>
          )}
          <div className="form-row">
            <div className="form-group">
              <label>Admission Date</label>
              <input
                type="date"
                name="admission_date"
                value={formData.admission_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Admission Time</label>
              <input
                type="time"
                name="admission_time"
                value={formData.admission_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Admission Type</label>
            <select
              name="admission_type"
              value={formData.admission_type}
              onChange={handleChange}
              required
            >
              <option value="emergency">Emergency</option>
              <option value="routine">Routine</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        <div className="ipd-form-section">
          <h3>Medical Assignment</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Attending Doctor</label>
              <select
                name="doctor_id"
                value={formData.doctor_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.first_name} {doctor.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Bed</label>
            <select
              name="bed_id"
              value={formData.bed_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Bed</option>
              {beds.map((bed) => (
                <option key={bed.id} value={bed.id}>
                  {bed.bed_number} - {bed.ward} ({bed.bed_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ipd-form-section">
          <h3>Payment & Insurance</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Payment Mode</label>
              <select
                name="payment_mode"
                value={formData.payment_mode}
                onChange={handleChange}
                required
              >
                <option value="cash">Cash</option>
                <option value="insurance">Insurance</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
            <div className="form-group">
              <label>Insurance Details</label>
              <input
                type="text"
                name="insurance_details"
                value={formData.insurance_details}
                onChange={handleChange}
                placeholder="Insurance provider & policy number"
              />
            </div>
          </div>
        </div>

        <div className="ipd-form-section">
          <h3>Emergency Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name</label>
              <input
                type="text"
                name="emergency_contact"
                value={formData.emergency_contact}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input
                type="tel"
                name="emergency_phone"
                value={formData.emergency_phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="ipd-form-section">
          <h3>Clinical Information</h3>
          <div className="form-group">
            <label>Chief Complaints</label>
            <textarea
              name="chief_complaints"
              value={formData.chief_complaints}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>
          <div className="form-group">
            <label>Diagnosis</label>
            <textarea
              name="diagnosis"
              value={formData.diagnosis}
              onChange={handleChange}
              rows="2"
            />
          </div>
          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Admit Patient
        </button>
      </form>
    </div>
  );
}

export default IPDAdmissionForm;
