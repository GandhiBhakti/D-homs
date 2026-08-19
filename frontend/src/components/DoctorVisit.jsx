import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./DoctorVisit.css";

function DoctorVisit() {
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    department_id: "",
    visit_date: new Date().toISOString().split("T")[0],
    visit_time: new Date().toTimeString().slice(0, 5),
    visit_type: "routine",
    chief_complaints: "",
    diagnosis: "",
    prescription: "",
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, doctorsRes, departmentsRes, visitsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/patients`),
        fetch(`${API_BASE_URL}/doctors`),
        fetch(`${API_BASE_URL}/departments`),
        fetch(`${API_BASE_URL}/doctor-visits`),
      ]);

      const patientsData = await patientsRes.json();
      const doctorsData = await doctorsRes.json();
      const departmentsData = await departmentsRes.json();
      const visitsData = await visitsRes.json();

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setVisits(Array.isArray(visitsData) ? visitsData : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load initial data");
      setPatients([]);
      setDoctors([]);
      setDepartments([]);
      setVisits([]);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/doctor-visits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Visit creation failed");

      setMessage("Doctor visit recorded successfully!");
      setFormData({
        patient_id: "",
        doctor_id: "",
        department_id: "",
        visit_date: new Date().toISOString().split("T")[0],
        visit_time: new Date().toTimeString().slice(0, 5),
        visit_type: "routine",
        chief_complaints: "",
        diagnosis: "",
        prescription: "",
        notes: "",
      });
      fetchInitialData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="doctor-visit">
      <div className="doctor-visit-header">
        <h2>Doctor Visits</h2>
        <p>Record and manage doctor visits for IPD patients</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="doctor-visit-content">
        <div className="visit-form">
          <h3>Add New Visit</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Patient</label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.patient_id} - {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>
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
                <label>Doctor</label>
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
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="visit_date"
                  value={formData.visit_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="visit_time"
                  value={formData.visit_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Visit Type</label>
              <select
                name="visit_type"
                value={formData.visit_type}
                onChange={handleChange}
                required
              >
                <option value="routine">Routine</option>
                <option value="emergency">Emergency</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
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
              <label>Prescription</label>
              <textarea
                name="prescription"
                value={formData.prescription}
                onChange={handleChange}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Record Visit
            </button>
          </form>
        </div>

        <div className="visits-history">
          <h3>Visit History</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Type</th>
                  <th>Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {visits.length > 0 ? (
                  visits.map((visit) => (
                    <tr key={visit.id}>
                      <td>{new Date(visit.visit_date).toLocaleDateString()}</td>
                      <td>{visit.patient_name}</td>
                      <td>Dr. {visit.doctor_name}</td>
                      <td>
                        <span className={`status ${visit.visit_type}`}>
                          {visit.visit_type}
                        </span>
                      </td>
                      <td>{visit.diagnosis || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No visits recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorVisit;
