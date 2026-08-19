import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./BedAllocation.css";

function BedAllocation() {
  const [formData, setFormData] = useState({
    patient_id: "",
    bed_id: "",
    allocation_date: new Date().toISOString().split("T")[0],
    allocation_time: new Date().toTimeString().slice(0, 5),
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [patientsRes, bedsRes, allocationsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/patients`),
        fetch(`${API_BASE_URL}/beds/available`),
        fetch(`${API_BASE_URL}/beds/allocations`),
      ]);

      const patientsData = await patientsRes.json();
      const bedsData = await bedsRes.json();
      const allocationsData = await allocationsRes.json();

      setPatients(Array.isArray(patientsData) ? patientsData : []);
      setBeds(Array.isArray(bedsData) ? bedsData : []);
      setAllocations(Array.isArray(allocationsData) ? allocationsData : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load initial data");
      setPatients([]);
      setBeds([]);
      setAllocations([]);
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
      const response = await fetch(`${API_BASE_URL}/beds/allocate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Allocation failed");

      setMessage("Bed allocated successfully!");
      setFormData({
        patient_id: "",
        bed_id: "",
        allocation_date: new Date().toISOString().split("T")[0],
        allocation_time: new Date().toTimeString().slice(0, 5),
        notes: "",
      });
      fetchInitialData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRelease = async (allocationId) => {
    if (!window.confirm("Are you sure you want to release this bed?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/beds/release/${allocationId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Release failed");
      fetchInitialData();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="bed-allocation">
      <div className="bed-allocation-header">
        <h2>Bed Allocation</h2>
        <p>Manage bed assignments for patients</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <div className="bed-allocation-content">
        <div className="allocation-form">
          <h3>Allocate New Bed</h3>
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
            <div className="form-group">
              <label>Bed</label>
              <select
                name="bed_id"
                value={formData.bed_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Available Bed</option>
                {beds.map((bed) => (
                  <option key={bed.id} value={bed.id}>
                    {bed.bed_number} - {bed.ward} ({bed.bed_type})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="allocation_date"
                  value={formData.allocation_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  name="allocation_time"
                  value={formData.allocation_time}
                  onChange={handleChange}
                  required
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
              Allocate Bed
            </button>
          </form>
        </div>

        <div className="allocations-list">
          <h3>Current Allocations</h3>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Bed</th>
                  <th>Ward</th>
                  <th>Allocated Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allocations.length > 0 ? (
                  allocations.map((allocation) => (
                    <tr key={allocation.id}>
                      <td>{allocation.patient_name}</td>
                      <td>{allocation.bed_number}</td>
                      <td>{allocation.ward}</td>
                      <td>{new Date(allocation.allocation_date).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-release"
                          onClick={() => handleRelease(allocation.id)}
                        >
                          Release
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="no-data">
                      No active allocations
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

export default BedAllocation;
