import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const DoctorPanel = ({ searchQuery }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="doctor-panel-container">
      <div className="doctor-panel-header">
        <h2>Doctor Panel</h2>
        <p>Welcome, Dr. {user?.first_name || user?.username}</p>
      </div>

      <div className="doctor-panel-content">
        <div className="doctor-info-card">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Username:</label>
              <span>{user?.username}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>
            <div className="info-item">
              <label>Full Name:</label>
              <span>{user?.first_name} {user?.last_name}</span>
            </div>
            <div className="info-item">
              <label>Role:</label>
              <span>{user?.role}</span>
            </div>
            <div className="info-item">
              <label>Default Password:</label>
              <span className="password-highlight">12345678</span>
            </div>
            <div className="info-item">
              <label>Account Status:</label>
              <span className={`status ${user?.is_active ? 'active' : 'inactive'}`}>
                {user?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <p className="password-note">
            Please change your password after first login for security.
          </p>
        </div>

        <div className="doctor-quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/leave')}>
              <span className="action-icon">🏖️</span>
              <span>My Leave Requests</span>
            </button>
            <button className="action-card" onClick={() => navigate('/prescriptions')}>
              <span className="action-icon">�</span>
              <span>Prescriptions</span>
            </button>
            <button className="action-card" onClick={() => navigate('/opd/list')}>
              <span className="action-icon">👥</span>
              <span>My Patients</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPanel;
