import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function RevenueOverview({ data }) {
  if (!data || !Array.isArray(data)) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const chartData = data.map((item, index) => ({
    name: item.bill_type,
    value: item.total,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="revenue-overview">
      <h3>Revenue Overview (MTD)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="revenue-stats">
        {chartData.map((item, index) => (
          <div key={index} className="revenue-stat">
            <div className="stat-dot" style={{ backgroundColor: item.color }}></div>
            <div className="stat-info">
              <div className="stat-name">{item.name}</div>
              <div className="stat-value">₹{item.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RevenueOverview;
