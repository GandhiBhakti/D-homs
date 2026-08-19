import React, { useEffect, useState } from "react";
import { opdService } from "../services/opdService";

function TodayOPD({ searchQuery = "", refreshKey = 0 }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const data = await opdService.getOPDVisits();
        // Filter for today's visits
        const today = new Date().toISOString().split("T")[0];
        const todayVisits = Array.isArray(data)
          ? data.filter((visit) => visit.visit_date === today)
          : [];
        setVisits(todayVisits);
      } catch (err) {
        setError(err.message || "Unable to load today's OPD visits");
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
          (visit.department_name || "").toLowerCase().includes(keyword)
        );
      })
    : [];

  if (loading) {
    return <div className="loading">Loading today's OPD visits...</div>;
  }

  return (
    <div className="opd-page-card">
      <div className="page-header">
        <div>
          <h2>Today's OPD</h2>
          <p>View and manage OPD visits for today.</p>
        </div>
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
              <th>Patient</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Doctor</th>
              <th>Visit Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVisits.length > 0 ? (
              filteredVisits.map((visit) => (
                <tr key={visit.id}>
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
                  <td>{visit.visit_date}</td>
                  <td>
                    <span className={`status ${visit.status || "active"}`}>
                      {visit.status || "Active"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{ textAlign: "center", padding: "2rem" }}
                >
                  No OPD visits found for today.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TodayOPD;
