import React, { useState } from "react";

function QuickActions({ onNavigate }) {
  const [expanded, setExpanded] = useState(true);

  const primaryActions = [
    { label: "Add New User", icon: "👤", target: "users", accent: "blue" },
    { label: "Create Role", icon: "🔐", target: "roles", accent: "purple" },
    {
      label: "Add Department",
      icon: "🏥",
      target: "departments",
      accent: "green",
    },
  ];

  const serviceModules = [
    {
      label: "OPD List",
      icon: "🩺",
      target: "opd-list",
      accent: "blue",
      badge: "View",
    },
    {
      label: "OPD Registration",
      icon: "📝",
      target: "opd-form",
      accent: "blue",
      badge: "New",
    },
    {
      label: "IPD List",
      icon: "�️",
      target: "ipd-list",
      accent: "orange",
      badge: "View",
    },
    {
      label: "IPD Admission",
      icon: "🏥",
      target: "ipd-form",
      accent: "orange",
      badge: "New",
    },
    {
      label: "Billing",
      icon: "�",
      target: "billing",
      accent: "green",
      badge: "Payments",
    },
  ];

  return (
    <div className="quick-actions-card">
      <div className="quick-actions-header">
        <div>
          <p className="quick-actions-kicker">Hospital Workflow</p>
          <h3>Services & Operations</h3>
        </div>
        <button
          className="toggle-services-btn"
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Hide" : "Show"}
        </button>
      </div>

      <div className="actions-grid">
        {primaryActions.map((action, index) => (
          <button
            key={index}
            className={`action-button action-${action.accent}`}
            type="button"
            onClick={() => onNavigate?.(action.target)}
          >
            <span className="action-icon">{action.icon}</span>
            <span className="action-label">{action.label}</span>
          </button>
        ))}
      </div>

      {expanded && (
        <div className="service-grid">
          {serviceModules.map((item, index) => (
            <button
              key={index}
              className={`service-tile service-${item.accent}`}
              type="button"
              onClick={() => onNavigate?.(item.target)}
            >
              <span className="service-badge">{item.badge}</span>
              <span className="service-icon">{item.icon}</span>
              <span className="service-label">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuickActions;
