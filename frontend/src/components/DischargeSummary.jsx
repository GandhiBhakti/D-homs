import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./DischargeSummary.css";

function DischargeSummary() {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSummaries();
  }, []);

  const fetchSummaries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ipd/discharges`);
      const data = await response.json();
      setSummaries(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch discharge summaries:", err);
      setSummaries([]);
      setLoading(false);
    }
  };

  const handleViewSummary = (summary) => {
    setSelectedSummary(summary);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredSummaries = summaries.filter((summary) =>
    summary.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.patient_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="loading">Loading discharge summaries...</div>;

  return (
    <div className="discharge-summary">
      <div className="discharge-summary-header">
        <h2>Discharge Summary</h2>
        <p>View patient discharge summaries</p>
      </div>

      {!selectedSummary ? (
        <>
          <div className="discharge-filters">
            <input
              type="search"
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Patient Name</th>
                  <th>Admission Date</th>
                  <th>Discharge Date</th>
                  <th>Discharge Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaries.length > 0 ? (
                  filteredSummaries.map((summary) => (
                    <tr key={summary.id}>
                      <td>{summary.patient_id}</td>
                      <td>{summary.patient_name}</td>
                      <td>{new Date(summary.admission_date).toLocaleDateString()}</td>
                      <td>{new Date(summary.discharge_date).toLocaleDateString()}</td>
                      <td>
                        <span className={`status ${summary.discharge_type}`}>
                          {summary.discharge_type.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <span className={`status ${summary.discharge_status}`}>
                          {summary.discharge_status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-view"
                          onClick={() => handleViewSummary(summary)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No discharge summaries found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="summary-detail">
          <button
            className="btn btn-secondary"
            onClick={() => setSelectedSummary(null)}
          >
            ← Back to List
          </button>
          <button
            className="btn btn-primary"
            onClick={handlePrint}
          >
            Print Summary
          </button>

          <div className="summary-paper">
            <div className="summary-header">
              <h1>DISCHARGE SUMMARY</h1>
              <p>Divine Hospital Speciality Hospital</p>
            </div>

            <div className="summary-section">
              <h3>Patient Information</h3>
              <div className="summary-grid">
                <div className="summary-field">
                  <span className="field-label">Patient ID:</span>
                  <span className="field-value">{selectedSummary.patient_id}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Patient Name:</span>
                  <span className="field-value">{selectedSummary.patient_name}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Age/Gender:</span>
                  <span className="field-value">{selectedSummary.age} / {selectedSummary.gender}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Phone:</span>
                  <span className="field-value">{selectedSummary.phone}</span>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h3>Admission Details</h3>
              <div className="summary-grid">
                <div className="summary-field">
                  <span className="field-label">Admission Date:</span>
                  <span className="field-value">{new Date(selectedSummary.admission_date).toLocaleDateString()}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Discharge Date:</span>
                  <span className="field-value">{new Date(selectedSummary.discharge_date).toLocaleDateString()}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Department:</span>
                  <span className="field-value">{selectedSummary.department}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Attending Doctor:</span>
                  <span className="field-value">Dr. {selectedSummary.doctor}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Bed Number:</span>
                  <span className="field-value">{selectedSummary.bed_number}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Length of Stay:</span>
                  <span className="field-value">{selectedSummary.length_of_stay} days</span>
                </div>
              </div>
            </div>

            <div className="summary-section">
              <h3>Discharge Information</h3>
              <div className="summary-grid">
                <div className="summary-field">
                  <span className="field-label">Discharge Type:</span>
                  <span className="field-value">{selectedSummary.discharge_type.replace(/_/g, " ")}</span>
                </div>
                <div className="summary-field">
                  <span className="field-label">Discharge Status:</span>
                  <span className="field-value">{selectedSummary.discharge_status}</span>
                </div>
                {selectedSummary.follow_up_date && (
                  <div className="summary-field">
                    <span className="field-label">Follow-up Date:</span>
                    <span className="field-value">{new Date(selectedSummary.follow_up_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="summary-section">
              <h3>Clinical Summary</h3>
              <div className="summary-field full">
                <span className="field-label">Chief Complaints:</span>
                <p className="field-value">{selectedSummary.chief_complaints}</p>
              </div>
              <div className="summary-field full">
                <span className="field-label">Diagnosis:</span>
                <p className="field-value">{selectedSummary.diagnosis}</p>
              </div>
              <div className="summary-field full">
                <span className="field-label">Treatment Summary:</span>
                <p className="field-value">{selectedSummary.treatment_summary}</p>
              </div>
            </div>

            <div className="summary-section">
              <h3>Discharge Instructions</h3>
              <div className="summary-field full">
                <span className="field-label">Medications:</span>
                <p className="field-value">{selectedSummary.medications}</p>
              </div>
              <div className="summary-field full">
                <span className="field-label">Diet Instructions:</span>
                <p className="field-value">{selectedSummary.diet_instructions}</p>
              </div>
              <div className="summary-field full">
                <span className="field-label">Activity Restrictions:</span>
                <p className="field-value">{selectedSummary.activity_restrictions}</p>
              </div>
              <div className="summary-field full">
                <span className="field-label">Additional Notes:</span>
                <p className="field-value">{selectedSummary.discharge_notes}</p>
              </div>
            </div>

            <div className="summary-footer">
              <p>Generated on: {new Date().toLocaleString()}</p>
              <p>Divine Hospital Speciality Hospital</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DischargeSummary;
