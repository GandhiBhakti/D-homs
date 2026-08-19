import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { leaveService } from "../services/leaveService";
import { doctorService } from "../services/doctorService";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";

const DoctorLeave = () => {
  const navigate = useNavigate();
  const { user, isDoctor, logout } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentDoctorId, setCurrentDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentLeave, setCurrentLeave] = useState(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log("Fetching leave data...");
      console.log("User:", user);
      console.log("Is doctor:", isDoctor());
      
      const [leavesData, doctorsData] = await Promise.all([
        leaveService.getAllLeaves(),
        doctorService.getAllDoctors(),
      ]);
      
      console.log("Leaves data:", leavesData);
      console.log("Doctors data:", doctorsData);
      
      setLeaves(leavesData);
      setDoctors(doctorsData);

      // Get current doctor's ID if user is a doctor
      if (isDoctor()) {
        const currentDoctor = doctorsData.find(doc => doc.user_id === user?.id);
        setCurrentDoctorId(currentDoctor?.id || null);
        console.log("Current doctor ID:", currentDoctor?.id);
        
        if (!currentDoctor) {
          console.warn("No doctor profile found for user:", user?.id);
        }
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.message.includes('Invalid or expired token') || err.message.includes('Authentication')) {
        setError("Your session has expired. Please log out and log back in.");
      } else {
        setError("Failed to fetch data: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentLeave(null);
    setShowModal(true);
  };

  const handleEdit = (leave) => {
    setCurrentLeave(leave);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await leaveService.deleteLeave(id);
        fetchData();
      } catch (err) {
        setError("Failed to delete leave");
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await leaveService.updateLeaveStatus(id, status);
      fetchData();
    } catch (err) {
      setError("Failed to update leave status");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="leave-container">
      <PageHeader title="Doctor Leave Management" onLogout={handleLogout} />
      <div className="header">
        <h2>{isDoctor() ? "My Leave Requests" : "Doctor Leave Management"}</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Leave Request
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            {!isDoctor() && <th>Doctor</th>}
            <th>Leave Type</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Reason</th>
            <th>Status</th>
            {!isDoctor() && <th>Approved By</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leaves.map((leave) => {
            // Doctors only see their own leaves
            if (isDoctor() && leave.doctor_id !== currentDoctorId) {
              return null;
            }
            return (
            <tr key={leave.id}>
              <td>{leave.id}</td>
              {!isDoctor() && (
                <td>
                  {leave.first_name} {leave.last_name}
                </td>
              )}
              <td>{leave.leave_type}</td>
              <td>{new Date(leave.start_date).toLocaleDateString()}</td>
              <td>{new Date(leave.end_date).toLocaleDateString()}</td>
              <td>{leave.reason}</td>
              <td>
                <span className={`status ${leave.status}`}>{leave.status}</span>
              </td>
              {!isDoctor() && <td>{leave.approved_by_name || "-"}</td>}
              <td>
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => handleEdit(leave)}
                >
                  Edit
                </button>
                {!isDoctor() && leave.status === "pending" && (
                  <>
                    <button
                      className="btn btn-sm btn-approve"
                      onClick={() => handleStatusUpdate(leave.id, "approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-reject"
                      onClick={() => handleStatusUpdate(leave.id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => handleDelete(leave.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && (
        <LeaveModal
          leave={currentLeave}
          doctors={doctors}
          currentDoctorId={currentDoctorId}
          isDoctor={isDoctor()}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

const LeaveModal = ({ leave, doctors, currentDoctorId, isDoctor, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    leave || {
      doctor_id: isDoctor ? currentDoctorId : "",
      leave_type: "sick",
      start_date: "",
      end_date: "",
      reason: "",
      status: "pending",
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If doctor, always use their own ID
      const submitData = isDoctor 
        ? { ...formData, doctor_id: currentDoctorId }
        : formData;
      
      console.log("Submitting leave data:", submitData);
      console.log("Current doctor ID:", currentDoctorId);
      console.log("Is doctor:", isDoctor);
      
      if (isDoctor && !currentDoctorId) {
        alert("Your doctor account is not linked to a doctor profile. Please contact admin or use a different doctor account.");
        return;
      }
        
      if (leave) {
        await leaveService.updateLeave(leave.id, submitData);
      } else {
        await leaveService.createLeave(submitData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving leave request:", err);
      alert("Failed to save leave request: " + err.message);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{leave ? "Edit Leave Request" : "Add Leave Request"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {!isDoctor && (
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
          )}
          <div className="form-group">
            <label>Leave Type</label>
            <select
              value={formData.leave_type}
              onChange={(e) =>
                setFormData({ ...formData, leave_type: e.target.value })
              }
            >
              <option value="sick">Sick Leave</option>
              <option value="vacation">Vacation</option>
              <option value="emergency">Emergency</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              rows="4"
            />
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

export default DoctorLeave;
