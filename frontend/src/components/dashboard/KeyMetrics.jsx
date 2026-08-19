import React from "react";

function KeyMetrics({ metrics }) {
  if (!metrics) return null;

  const metricsData = [
    {
      label: "Total Patients",
      value: metrics.totalPatients || 0,
      change: "+12%",
      positive: true,
      icon: "🧑‍⚕️",
    },
    {
      label: "OPD Today",
      value: metrics.opdToday || 0,
      change: "+8%",
      positive: true,
      icon: "🩺",
    },
    {
      label: "IPD Currently",
      value: metrics.ipdCurrent || 0,
      change: "-3%",
      positive: false,
      icon: "🛏️",
    },
    {
      label: "Revenue (MTD)",
      value: `₹${(metrics.revenueMTD || 0).toLocaleString()}`,
      change: "+15%",
      positive: true,
      icon: "💰",
    },
    {
      label: "Total Users",
      value: metrics.totalUsers || 0,
      change: "+5%",
      positive: true,
      icon: "👥",
    },
  ];

  return (
    <div className="key-metrics">
      {metricsData.map((metric, index) => (
        <div key={index} className="metric-card">
          <div className="metric-icon">{metric.icon}</div>
          <div className="metric-label">{metric.label}</div>
          <div className="metric-value">{metric.value}</div>
          <div
            className={`metric-change ${metric.positive ? "positive" : "negative"}`}
          >
            {metric.change}
          </div>
        </div>
      ))}
    </div>
  );
}

export default KeyMetrics;
