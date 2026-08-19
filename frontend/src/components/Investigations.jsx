import React, { useState, useEffect } from "react";
import { investigationService } from "../services/investigationService";
import Toast from "./Toast";
import "./Investigations.css";

const Investigations = ({ patientVisitId, patientId }) => {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    investigation_type: "Laboratory",
    investigation_name: "",
    number_of_xrays: 1,
    notes: "",
  });

  const investigationTypes = [
    "Laboratory",
    "X-Ray",
    "USG",
    "ECG",
    "2D Echo",
    "CT Scan",
    "MRI",
    "Other",
  ];

  useEffect(() => {
    fetchInvestigations();
  }, [patientVisitId, patientId]);

  const fetchInvestigations = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (patientVisitId) filters.patient_visit_id = patientVisitId;
      if (patientId) filters.patient_id = patientId;
      
      const data = await investigationService.getAllInvestigations(filters);
      setInvestigations(data);
    } catch (error) {
      console.error("Error fetching investigations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await investigationService.createInvestigation({
        ...formData,
        patient_visit_id: patientVisitId,
        patient_id: patientId,
      });
      setToast({ message: "Investigation added successfully!", type: "success" });
      setFormData({
        investigation_type: "Laboratory",
        investigation_name: "",
        number_of_xrays: 1,
        notes: "",
      });
      setShowModal(false);
      fetchInvestigations();
    } catch (error) {
      setToast({ message: error.message, type: "error" });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this investigation?")) {
      try {
        await investigationService.deleteInvestigation(id);
        setToast({ message: "Investigation deleted successfully!", type: "success" });
        fetchInvestigations();
      } catch (error) {
        setToast({ message: error.message, type: "error" });
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="loading">Loading investigations...</div>;

  return (
    <div className="investigations-container">
      <div className="header">
        <h3>Investigations</h3>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Investigation
        </button>
      </div>

      {investigations.length === 0 ? (
        <div className="no-data">No investigations found</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th>X-Rays</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {investigations.map((inv) => (
              <tr key={inv.id}>
                <td>{inv.investigation_type}</td>
                <td>{inv.investigation_name}</td>
                <td>{inv.number_of_xrays}</td>
                <td>
                  <span className={`status ${inv.status}`}>{inv.status}</span>
                </td>
                <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(inv.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {investigations.length > 0 && (
        <button className="btn btn-secondary mt-3" onClick={handlePrint}>
          Print Investigations
        </button>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Investigation</h3>
              <button onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Investigation Type</label>
                <select
                  value={formData.investigation_type}
                  onChange={(e) =>
                    setFormData({ ...formData, investigation_type: e.target.value })
                  }
                >
                  {investigationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Investigation Name</label>
                <input
                  type="text"
                  value={formData.investigation_name}
                  onChange={(e) =>
                    setFormData({ ...formData, investigation_name: e.target.value })
                  }
                  required
                />
              </div>
              {formData.investigation_type === "X-Ray" && (
                <div className="form-group">
                  <label>Number of X-Rays</label>
                  <input
                    type="number"
                    value={formData.number_of_xrays}
                    onChange={(e) =>
                      setFormData({ ...formData, number_of_xrays: parseInt(e.target.value) })
                    }
                    min="1"
                  />
                </div>
              )}
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Investigations;
