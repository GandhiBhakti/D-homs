import React from 'react';

function RecentActivity({ data }) {
  if (!data) return null;

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getActionIcon = (action) => {
    if (action.includes('User')) return '👤';
    if (action.includes('Department')) return '🏥';
    if (action.includes('Backup')) return '💾';
    if (action.includes('Role')) return '🔐';
    if (action.includes('Payment')) return '💰';
    return '📋';
  };

  return (
    <div className="recent-activity">
      <h3>Recent System Activity</h3>
      <div className="activity-list">
        {data.map((activity, index) => (
          <div key={index} className="activity-item">
            <div className="activity-icon">{getActionIcon(activity.action)}</div>
            <div className="activity-details">
              <div className="activity-action">{activity.action}</div>
              <div className="activity-meta">
                {activity.entity_type && <span className="activity-entity">{activity.entity_type}</span>}
                <span className="activity-time">{formatTime(activity.created_at)}</span>
              </div>
              {activity.username && (
                <div className="activity-user">
                  by {activity.first_name} {activity.last_name} ({activity.username})
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;
