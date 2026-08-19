import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./AddVitals.css";

function AddVitals() {
  const [formData, setFormData] = useState({
    patient_id: "",
    recorded_date: new Date().toISOString().split("T")[0],
    recorded_time: new Date().toTimeString().slice(0, 5),
    temperature: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    heart_rate: "",
    respiratory_rate: "",
    oxygen_saturation: "",
    weight: "",
    height: "",
    blood_sugar: "",
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, vitalsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/patients`),
        fetch(`${API_BASE_URL}/vitals`),
      ]);

      const patientsData = await patientsRes.json();
      const vitalsData = await vitalsRes.json();

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setVitals(Array.isArray(vitalsData) ? vitalsData : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load initial data");
      setPatients([]);
      setVitals([]);
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
      const response = await fetch(`${API_BASE_URL}/vitals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Vitals recording failed");

      setMessage("Vitals recorded successfully!");
      setFormData({
        patient_id: "",
        recorded_date: new Date().toISOString().split("T")[0],
        recorded_time: new Date().toTimeString().slice(0, 5),
        temperature: "",
        blood_pressure_systolic: "",
        blood_pressure_diastolic: "",
        heart_rate: "",
        respiratory_rate: "",
        oxygen_saturation: "",
        weight: "",
        height: "",
        blood_sugar: "",
        notes: "",
      });
      fetchInitialData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="add-vitals">
      <div className="add-vitals-header">
        <h2>Add Vitals</h2>
        <p>Record patient vital signs</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="vitals-content">
        <div className="vitals-form">
          <h3>Record New Vitals</h3>
          <form onSubmit={handleSubmit}>
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
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="recorded_date"
                  value={formData.recorded_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="recorded_time"
                  value={formData.recorded_time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="vitals-grid">
              <div className="form-group">
                <label>Temperature (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  name="temperature"
                  value={formData.temperature}
                  onChange={handleChange}
                  placeholder="98.6"
                />
              </div>
              <div className="form-group">
                <label>Heart Rate (bpm)</label>
                <input
                  type="number"
                  name="heart_rate"
                  value={formData.heart_rate}
                  onChange={handleChange}
                  placeholder="72"
                />
              </div>
              <div className="form-group">
                <label>Respiratory Rate (/min)</label>
                <input
                  type="number"
                  name="respiratory_rate"
                  value={formData.respiratory_rate}
                  onChange={handleChange}
                  placeholder="16"
                />
              </div>
              <div className="form-group">
                <label>Oxygen Saturation (%)</label>
                <input
                  type="number"
                  name="oxygen_saturation"
                  value={formData.oxygen_saturation}
                  onChange={handleChange}
                  placeholder="98"
                />
              </div>
              <div className="form-group">
                <label>Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                />
              </div>
              <div className="form-group">
                <label>Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="170"
                />
              </div>
              <div className="form-group">
                <label>Blood Sugar (mg/dL)</label>
                <input
                  type="number"
                  name="blood_sugar"
                  value={formData.blood_sugar}
                  onChange={handleChange}
                  placeholder="100"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Blood Pressure</label>
              <div className="bp-inputs">
                <input
                  type="number"
                  name="blood_pressure_systolic"
                  value={formData.blood_pressure_systolic}
                  onChange={handleChange}
                  placeholder="Systolic (120)"
                />
                <span className="bp-separator">/</span>
                <input
                  type="number"
                  name="blood_pressure_diastolic"
                  value={formData.blood_pressure_diastolic}
                  onChange={handleChange}
                  placeholder="Diastolic (80)"
                />
              </div>
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
              Record Vitals
            </button>
          </form>
        </div>

        <div className="vitals-history">
          <h3>Recent Vitals</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Temp</th>
                  <th>BP</th>
                  <th>HR</th>
                  <th>SpO2</th>
                </tr>
              </thead>
              <tbody>
                {vitals.length > 0 ? (
                  vitals.slice(0, 10).map((vital) => (
                    <tr key={vital.id}>
                      <td>{new Date(vital.recorded_date).toLocaleDateString()}</td>
                      <td>{vital.patient_name}</td>
                      <td>{vital.temperature || "-"}</td>
                      <td>
                        {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                      </td>
                      <td>{vital.heart_rate || "-"}</td>
                      <td>{vital.oxygen_saturation || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No vitals recorded
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

export default AddVitals;
