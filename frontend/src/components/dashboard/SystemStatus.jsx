import React from 'react';

function SystemStatus({ services }) {
  if (!services || !Array.isArray(services)) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return '#10b981';
      case 'degraded': return '#f59e0b';
      case 'down': return '#ef4444';
      case 'maintenance': return '#6366f1';
      default: return '#6b7280';
    }
  };

  return (
    <div className="system-status">
      <h3>System Status</h3>
      <div className="status-list">
        {services.map((service, index) => (
          <div key={index} className="status-item">
            <div className="status-info">
              <div className="status-dot" style={{ backgroundColor: getStatusColor(service.status) }}></div>
              <div className="status-name">{service.service_name}</div>
            </div>
            <div className={`status-badge ${service.status}`}>
              {service.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SystemStatus;
