import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

function DepartmentOPD({ data }) {
  if (!data || !Array.isArray(data)) return null;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'];

  const chartData = data.map((item, index) => ({
    name: item.department,
    value: item.count,
    color: COLORS[index % COLORS.length]
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="department-opd">
      <h3>Department-Wise OPD (Today)</h3>
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
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="opd-stats">
        {chartData.map((item, index) => (
          <div key={index} className="opd-stat">
            <div className="stat-dot" style={{ backgroundColor: item.color }}></div>
            <div className="stat-info">
              <div className="stat-name">{item.name}</div>
              <div className="stat-value">{item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DepartmentOPD;
