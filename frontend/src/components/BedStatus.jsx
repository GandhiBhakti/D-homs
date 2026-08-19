import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./BedStatus.css";

function BedStatus() {
  const [beds, setBeds] = useState([]);
  const [filterWard, setFilterWard] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/beds`);
      const data = await response.json();
      setBeds(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch beds:", err);
      setBeds([]);
      setLoading(false);
    }
  };

  const filteredBeds = beds.filter((bed) => {
    const matchesWard = filterWard === "all" || bed.ward === filterWard;
    const matchesType = filterType === "all" || bed.bed_type === filterType;
    return matchesWard && matchesType;
  });

  const availableCount = filteredBeds.filter((b) => b.status === "available").length;
  const occupiedCount = filteredBeds.filter((b) => b.status === "occupied").length;
  const maintenanceCount = filteredBeds.filter((b) => b.status === "maintenance").length;

  const wards = [...new Set(beds.map((b) => b.ward))];
  const bedTypes = [...new Set(beds.map((b) => b.bed_type))];

  if (loading) return <div className="loading">Loading bed status...</div>;

  return (
    <div className="bed-status">
      <div className="bed-status-header">
        <h2>Bed Status</h2>
        <p>View and manage bed availability across all wards</p>
      </div>

      <div className="bed-stats">
        <div className="stat-card available">
          <div className="stat-number">{availableCount}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card occupied">
          <div className="stat-number">{occupiedCount}</div>
          <div className="stat-label">Occupied</div>
        </div>
        <div className="stat-card maintenance">
          <div className="stat-number">{maintenanceCount}</div>
          <div className="stat-label">Maintenance</div>
        </div>
        <div className="stat-card total">
          <div className="stat-number">{filteredBeds.length}</div>
          <div className="stat-label">Total Beds</div>
        </div>
      </div>

      <div className="bed-filters">
        <select
          value={filterWard}
          onChange={(e) => setFilterWard(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Wards</option>
          {wards.map((ward) => (
            <option key={ward} value={ward}>
              {ward}
            </option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Types</option>
          {bedTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="bed-grid">
        {filteredBeds.map((bed) => (
          <div key={bed.id} className={`bed-card ${bed.status}`}>
            <div className="bed-card-header">
              <span className="bed-number">{bed.bed_number}</span>
              <span className={`bed-status-badge ${bed.status}`}>
                {bed.status}
              </span>
            </div>
            <div className="bed-card-body">
              <div className="bed-info">
                <span className="bed-label">Ward:</span>
                <span className="bed-value">{bed.ward}</span>
              </div>
              <div className="bed-info">
                <span className="bed-label">Type:</span>
                <span className="bed-value">{bed.bed_type}</span>
              </div>
              {bed.patient_name && (
                <div className="bed-info">
                  <span className="bed-label">Patient:</span>
                  <span className="bed-value">{bed.patient_name}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BedStatus;
