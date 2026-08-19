import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./DischargeForm.css";

function DischargeForm() {
  const [formData, setFormData] = useState({
    admission_id: "",
    discharge_date: new Date().toISOString().split("T")[0],
    discharge_time: new Date().toTimeString().slice(0, 5),
    discharge_type: "recovered",
    discharge_status: "stable",
    follow_up_date: "",
    discharge_notes: "",
    medications: "",
    diet_instructions: "",
    activity_restrictions: "",
  });

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActiveAdmissions();
  }, []);

  const fetchActiveAdmissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ipd/active`);
      const data = await response.json();
      setAdmissions(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setAdmissions([]);
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
      const response = await fetch(`${API_BASE_URL}/ipd/${formData.admission_id}/discharge`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discharge_date: formData.discharge_date,
          discharge_notes: formData.discharge_notes,
          final_diagnosis: formData.discharge_status
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Discharge failed");

      setMessage("Patient discharged successfully!");
      setFormData({
        admission_id: "",
        discharge_date: new Date().toISOString().split("T")[0],
        discharge_time: new Date().toTimeString().slice(0, 5),
        discharge_type: "recovered",
        discharge_status: "stable",
        follow_up_date: "",
        discharge_notes: "",
        medications: "",
        diet_instructions: "",
        activity_restrictions: "",
      });
      fetchActiveAdmissions();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="discharge-form">
      <div className="discharge-form-header">
        <h2>Discharge Form</h2>
        <p>Process patient discharge from the hospital</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form className="discharge-form-content" onSubmit={handleSubmit}>
        <div className="discharge-section">
          <h3>Patient Selection</h3>
          <div className="form-group">
            <label>Select Admission</label>
            <select
              name="admission_id"
              value={formData.admission_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Active Admission</option>
              {admissions.map((admission) => (
                <option key={admission.id} value={admission.id}>
                  {admission.patient_id} - {admission.patient_name} (Bed: {admission.bed_number})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="discharge-section">
          <h3>Discharge Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Discharge Date</label>
              <input
                type="date"
                name="discharge_date"
                value={formData.discharge_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Discharge Time</label>
              <input
                type="time"
                name="discharge_time"
                value={formData.discharge_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Discharge Type</label>
              <select
                name="discharge_type"
                value={formData.discharge_type}
                onChange={handleChange}
                required
              >
                <option value="recovered">Recovered</option>
                <option value="improved">Improved</option>
                <option value="against_medical_advice">Against Medical Advice</option>
                <option value="referred">Referred</option>
                <option value="death">Death</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discharge Status</label>
              <select
                name="discharge_status"
                value={formData.discharge_status}
                onChange={handleChange}
                required
              >
                <option value="stable">Stable</option>
                <option value="critical">Critical</option>
                <option value="serious">Serious</option>
                <option value="fair">Fair</option>
              </select>
            </div>
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
        </div>

        <div className="discharge-section">
          <h3>Discharge Instructions</h3>
          <div className="form-group">
            <label>Discharge Notes</label>
            <textarea
              name="discharge_notes"
              value={formData.discharge_notes}
              onChange={handleChange}
              rows="3"
              placeholder="Summary of treatment and condition at discharge"
            />
          </div>
          <div className="form-group">
            <label>Medications</label>
            <textarea
              name="medications"
              value={formData.medications}
              onChange={handleChange}
              rows="4"
              placeholder="List of prescribed medications with dosage and frequency"
            />
          </div>
          <div className="form-group">
            <label>Diet Instructions</label>
            <textarea
              name="diet_instructions"
              value={formData.diet_instructions}
              onChange={handleChange}
              rows="2"
              placeholder="Dietary recommendations"
            />
          </div>
          <div className="form-group">
            <label>Activity Restrictions</label>
            <textarea
              name="activity_restrictions"
              value={formData.activity_restrictions}
              onChange={handleChange}
              rows="2"
              placeholder="Any activity limitations or restrictions"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Process Discharge
        </button>
      </form>
    </div>
  );
}

export default DischargeForm;
