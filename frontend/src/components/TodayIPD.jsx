import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

function TodayIPD({ searchQuery = "", refreshKey = 0 }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/ipd`);
        const data = await response.json();
        // Filter for today's admissions
        const today = new Date().toISOString().split("T")[0];
        const todayVisits = Array.isArray(data)
          ? data.filter((visit) => visit.admission_date === today)
          : [];
        setVisits(todayVisits);
      } catch (err) {
        setError(err.message || "Unable to load today's IPD admissions");
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [refreshKey]);

  const filteredVisits = Array.isArray(visits)
    ? visits.filter((visit) => {
        const keyword = localSearchQuery.toLowerCase();
        const fullName =
          `${visit.first_name || ""} ${visit.last_name || ""}`.toLowerCase();
        return (
          fullName.includes(keyword) ||
          (visit.phone || "").includes(keyword) ||
          (visit.department_name || "").toLowerCase().includes(keyword) ||
          (visit.patient_id || "").toLowerCase().includes(keyword)
        );
      })
    : [];

  const handleDischarge = async (visitId) => {
    if (!window.confirm("Are you sure you want to discharge this patient?")) {
      return;
    }

    try {
      const dischargeDate = new Date().toISOString().slice(0, 10);
      const response = await fetch(`${API_BASE_URL}/ipd/${visitId}/discharge`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discharge_date: dischargeDate }),
      });

      if (response.ok) {
        setVisits(
          visits.map((v) =>
            v.id === visitId
              ? { ...v, status: "completed", discharge_date: dischargeDate }
              : v,
          ),
        );
      } else {
        setError("Failed to discharge patient");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading today's IPD admissions...</div>;
  }

  return (
    <div className="opd-page-card">
      <div className="page-header">
        <div>
          <h2>Today's IPD Admissions</h2>
          <p>View and manage inpatient admissions for today.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name, phone, department, or patient ID..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Admission Date</th>
              <th>Discharge Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.length > 0 ? (
              filteredVisits.map((visit) => (
                <tr key={visit.id}>
                  <td>{visit.patient_id || "-"}</td>
                  <td>
                    {visit.first_name} {visit.last_name}
                  </td>
                  <td>{visit.phone || "-"}</td>
                  <td>{visit.department_name || "-"}</td>
                  <td>
                    {visit.doctor_first_name || visit.doctor_last_name
                      ? `${visit.doctor_first_name || ""} ${visit.doctor_last_name || ""}`.trim()
                      : "-"}
                  </td>
                  <td>{visit.admission_date || "-"}</td>
                  <td>{visit.discharge_date || "-"}</td>
                  <td>
                    <span className={`status ${visit.status || "active"}`}>
                      {visit.status === "active"
                        ? "Admitted"
                        : visit.status || "Active"}
                    </span>
                  </td>
                  <td>
                    {visit.status === "active" && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDischarge(visit.id)}
                      >
                        Discharge
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="9"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No IPD admissions found for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TodayIPD;
