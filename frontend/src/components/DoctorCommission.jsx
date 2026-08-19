import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import { commissionService } from "../services/commissionService";
import { doctorService } from "../services/doctorService";

const DoctorCommission = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [commissions, setCommissions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCommission, setCurrentCommission] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commissionsData, doctorsData] = await Promise.all([
        commissionService.getAllCommissions(),
        doctorService.getAllDoctors(),
      ]);
      setCommissions(commissionsData);
      setDoctors(doctorsData);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentCommission(null);
    setShowModal(true);
  };

  const handleEdit = (commission) => {
    setCurrentCommission(commission);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this commission?")) {
      try {
        await commissionService.deleteCommission(id);
        fetchData();
      } catch (err) {
        setError("Failed to delete commission");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="commission-container">
      <PageHeader title="Doctor Commission" onLogout={handleLogout} />
      <div className="header">
        <h2>Doctor Commission Management</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Commission
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Doctor</th>
            <th>Value</th>
            <th>Effective From</th>
            <th>Effective To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {commissions.map((commission, index) => (
            <tr key={commission.id}>
              <td>{index + 1}</td>
              <td>
                {commission.doctor_first_name} {commission.doctor_last_name}
              </td>
              <td>
                {commission.opd_commission_type === "percentage"
                  ? `${commission.opd_commission_value}%`
                  : `₹${commission.opd_commission_value}`}
              </td>
              <td>
                {new Date(commission.effective_from).toLocaleDateString()}
              </td>
              <td>
                {commission.effective_to
                  ? new Date(commission.effective_to).toLocaleDateString()
                  : "Ongoing"}
              </td>
              <td>
                <span
                  className={`status ${commission.is_active ? "active" : "inactive"}`}
                >
                  {commission.is_active ? "Active" : "Inactive"}
                </span>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => handleEdit(commission)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => handleDelete(commission.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <CommissionModal
          commission={currentCommission}
          doctors={doctors}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

const CommissionModal = ({ commission, doctors, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    commission || {
      doctor_id: "",
      opd_commission_type: "percentage",
      opd_commission_value: "",
      effective_from: "",
      effective_to: "",
      is_active: true,
      description: "",
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (commission) {
        await commissionService.updateCommission(commission.id, formData);
      } else {
        await commissionService.createCommission(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save commission");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{commission ? "Edit Commission" : "Add Commission"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Doctor</label>
            <select
              value={formData.doctor_id}
              onChange={(e) =>
                setFormData({ ...formData, doctor_id: e.target.value })
              }
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Commission Type</label>
            <select
              value={formData.opd_commission_type}
              onChange={(e) =>
                setFormData({ ...formData, opd_commission_type: e.target.value })
              }
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div className="form-group">
            <label>Commission Value</label>
            <input
              type="number"
              step="0.01"
              value={formData.opd_commission_value}
              onChange={(e) =>
                setFormData({ ...formData, opd_commission_value: e.target.value })
              }
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Effective From</label>
              <input
                type="date"
                value={formData.effective_from}
                onChange={(e) =>
                  setFormData({ ...formData, effective_from: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Effective To</label>
              <input
                type="date"
                value={formData.effective_to}
                onChange={(e) =>
                  setFormData({ ...formData, effective_to: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
              Active
            </label>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorCommission;
