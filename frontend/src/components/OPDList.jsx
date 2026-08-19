import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import { opdService } from "../services/opdService";
import { doctorService } from "../services/doctorService";
import { useAuth } from "../contexts/AuthContext";

function OPDList({ searchQuery = "", refreshKey = 0 }) {
  const navigate = useNavigate();
  const { user, isDoctor, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [visits, setVisits] = useState([]);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState(
    searchQuery || searchParams.get("search") || "",
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [visitsData, doctorsData] = await Promise.all([
          opdService.getOPDVisits(),
          doctorService.getAllDoctors(),
        ]);

        console.log("OPD Visits data:", visitsData);
        setVisits(Array.isArray(visitsData) ? visitsData : []);

        // Get current doctor's ID if user is a doctor
        if (isDoctor()) {
          const currentDoctor = doctorsData.find(
            (doc) => doc.user_id === user?.id,
          );
          setCurrentDoctorId(currentDoctor?.id || null);
        }
      } catch (err) {
        console.error("Error loading OPD visits:", err);
        setError(err.message || "Unable to load OPD visits");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isDoctor, user?.id, refreshKey]);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  useEffect(() => {
    if (searchParams.get("search")) {
      setLocalSearchQuery(searchParams.get("search"));
    }
  }, [searchParams]);

  const filteredVisits = visits.filter((visit) => {
    // If user is a doctor, only show their own patients
    if (isDoctor() && visit.doctor_id !== currentDoctorId) {
      return false;
    }

    const keyword = localSearchQuery.toLowerCase();
    const fullName =
      `${visit.first_name || ""} ${visit.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(keyword) ||
      (visit.phone || "").includes(keyword) ||
      (visit.department_name || "").toLowerCase().includes(keyword)
    );
  });

  const handleSelectPatient = (visitId) => {
    setSelectedPatients((prev) =>
      prev.includes(visitId)
        ? prev.filter((id) => id !== visitId)
        : [...prev, visitId],
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredVisits.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredVisits.map((v) => v.id));
    }
  };

  if (loading) {
    return <div className="loading">Loading OPD list...</div>;
  }

  return (
    <div className="opd-page-card">
      <PageHeader title="OPD Patient List" onLogout={handleLogout} />
      <div className="page-header">
        <div>
          <p>Review registered visits for the current OPD workflow.</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/opd/registration")}
        >
          + New OPD Registration
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name, phone, or department..."
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "50px" }}>
                <input
                  type="checkbox"
                  checked={
                    selectedPatients.length === filteredVisits.length &&
                    filteredVisits.length > 0
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th>Patient ID</th>
              <th>Patient</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Visit Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.map((visit, index) => (
              <tr key={visit.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedPatients.includes(visit.id)}
                    onChange={() => handleSelectPatient(visit.id)}
                  />
                </td>
                <td>{visit.patient_id || `OPD-${index + 1}`}</td>
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
                  {visit.visit_date
                    ? new Date(visit.visit_date).toLocaleDateString("en-IN")
                    : "-"}
                </td>
                <td>
                  <span className={`status ${visit.status || "active"}`}>
                    {visit.status || "Active"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default OPDList;
