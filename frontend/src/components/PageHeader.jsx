import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PageHeader.css';

const PageHeader = ({ title, onLogout }) => {
  const { user } = useAuth();

  const getUserRoleDisplay = () => {
    if (!user) return '';
    const role = user.role || 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="page-header">
      <h1>{title}</h1>
      {user && (
        <div className="header-actions">
          <span className="user-info">
            {getUserRoleDisplay()}
          </span>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default PageHeader;
