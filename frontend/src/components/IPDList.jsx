import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import API_BASE_URL from "../config/api";

function IPDList({ searchQuery = "", refreshKey = 0 }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState(
    searchQuery || searchParams.get("search") || "",
  );

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        };
        const response = await fetch(`${API_BASE_URL}/ipd`, { headers });
        const data = await response.json();
        console.log("IPD Visits data:", data);
        setVisits(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error loading IPD visits:", err);
        setError(err.message || "Unable to load IPD visits");
        setVisits([]);
      } finally {
        setLoading(false);
      }
    };

    loadVisits();
  }, [refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  useEffect(() => {
    if (searchParams.get("search")) {
      setLocalSearchQuery(searchParams.get("search"));
    }
  }, [searchParams]);

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
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };
      const response = await fetch(`${API_BASE_URL}/ipd/${visitId}/discharge`, {
        method: "PUT",
        headers: headers,
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
    return <div className="loading">Loading IPD list...</div>;
  }

  return (
    <div className="opd-page-card">
      <PageHeader title="IPD Patient List" onLogout={handleLogout} />
      <div className="page-header">
        <div>
          <p>Manage inpatient admissions and discharges.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/ipd/registration")}
        >
          + New IPD Registration
        </button>
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
              <th>ID</th>
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
            {filteredVisits.map((visit, index) => (
              <tr key={visit.id}>
                <td>{index + 1}</td>
                <td>{visit.patient_id || "-"}</td>
                <td>
                  {visit.first_name} {visit.last_name}
                </td>
                <td>{visit.phone || "-"}</td>
                <td>{visit.department_name || "-"}</td>
                <td>
                  {visit.doctor_first_name || visit.doctor_last_name
                    ? `Dr. ${visit.doctor_first_name || ""} ${visit.doctor_last_name || ""}`.trim()
                    : "-"}
                </td>
                <td>
                  {visit.admission_date
                    ? new Date(visit.admission_date).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>
                  {visit.discharge_date
                    ? new Date(visit.discharge_date).toLocaleDateString("en-IN")
                    : "-"}
                </td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default IPDList;
