import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./IPDAdmissionList.css";

function IPDAdmissionList() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const fetchAdmissions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ipd/admissions`);
      const data = await response.json();
      setAdmissions(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch admissions:", err);
      setAdmissions([]);
      setLoading(false);
    }
  };

  const handleDischarge = async (admissionId) => {
    if (!window.confirm("Are you sure you want to discharge this patient?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/ipd/discharge/${admissionId}`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Discharge failed");
      fetchAdmissions();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredAdmissions = admissions.filter((admission) => {
    const matchesSearch =
      admission.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      admission.bed_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || admission.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">Loading admissions...</div>;

  return (
    <div className="ipd-admission-list">
      <div className="ipd-list-header">
        <h2>IPD Admissions</h2>
        <p>Manage in-patient admissions</p>
      </div>

      <div className="ipd-filters">
        <input
          type="search"
          placeholder="Search by patient, ID, or bed..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="discharged">Discharged</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="ipd-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient Name</th>
              <th>Admission Date</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Bed</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmissions.length > 0 ? (
              filteredAdmissions.map((admission) => (
                <tr key={admission.id}>
                  <td>{admission.patient_id}</td>
                  <td>{admission.patient_name}</td>
                  <td>{new Date(admission.admission_date).toLocaleDateString()}</td>
                  <td>{admission.department_name}</td>
                  <td>Dr. {admission.doctor_name}</td>
                  <td>{admission.bed_number}</td>
                  <td>
                    <span className={`status ${admission.status}`}>
                      {admission.status}
                    </span>
                  </td>
                  <td>
                    {admission.status === "active" && (
                      <button
                        className="btn btn-sm btn-discharge"
                        onClick={() => handleDischarge(admission.id)}
                      >
                        Discharge
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  No admissions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IPDAdmissionList;
