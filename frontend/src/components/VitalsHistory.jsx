import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./VitalsHistory.css";

function VitalsHistory() {
  const[vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vitals`);
      const data = await response.json();
      setVitals(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch vitals:", err);
      setVitals([]);
      setLoading(false);
    }
  };

  const filteredVitals = vitals.filter((vital) => {
    const matchesPatient =
      selectedPatient === "all" || vital.patient_id === selectedPatient;
    
    const matchesDateRange =
      (!dateRange.start || new Date(vital.recorded_date) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(vital.recorded_date) <= new Date(dateRange.end));

    return matchesPatient && matchesDateRange;
  });

  const patients = [...new Set(vitals.map((v) => v.patient_id))];

  if (loading) return <div className="loading">Loading vitals history...</div>;

  return (
    <div className="vitals-history">
      <div className="vitals-history-header">
        <h2>Vitals History</h2>
        <p>View historical patient vital signs</p>
      </div>

      <div className="vitals-filters">
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Patients</option>
          {patients.map((patientId) => (
            <option key={patientId} value={patientId}>
              {patientId}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="filter-input"
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="filter-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>Patient</th>
              <th>Temperature</th>
              <th>Blood Pressure</th>
              <th>Heart Rate</th>
              <th>Respiratory Rate</th>
              <th>O2 Saturation</th>
              <th>Weight</th>
              <th>Blood Sugar</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredVitals.length > 0 ? (
              filteredVitals.map((vital) => (
                <tr key={vital.id}>
                  <td>
                    {new Date(vital.recorded_date).toLocaleDateString()}{" "}
                    {vital.recorded_time}
                  </td>
                  <td>{vital.patient_name}</td>
                  <td>{vital.temperature ? `${vital.temperature}°F` : "-"}</td>
                  <td>
                    {vital.blood_pressure_systolic && vital.blood_pressure_diastolic
                      ? `${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}`
                      : "-"}
                  </td>
                  <td>{vital.heart_rate ? `${vital.heart_rate} bpm` : "-"}</td>
                  <td>
                    {vital.respiratory_rate
                      ? `${vital.respiratory_rate}/min`
                      : "-"}
                  </td>
                  <td>
                    {vital.oxygen_saturation ? `${vital.oxygen_saturation}%` : "-"}
                  </td>
                  <td>{vital.weight ? `${vital.weight} kg` : "-"}</td>
                  <td>
                    {vital.blood_sugar ? `${vital.blood_sugar} mg/dL` : "-"}
                  </td>
                  <td>{vital.notes || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="no-data">
                  No vitals found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VitalsHistory;
