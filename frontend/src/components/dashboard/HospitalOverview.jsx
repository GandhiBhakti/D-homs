import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function HospitalOverview({ data }) {
  if (!data || typeof data !== 'object') return null;

  // Generate last 7 days dates
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const dates = getLast7Days();

  // Transform data for chart
  const chartData = dates.map((date, index) => ({
    date,
    OPD: data.opd?.[index]?.count || 0,
    IPD: data.ipd?.[index]?.count || 0,
    Admissions: data.admissions?.[index]?.count || 0,
    Discharges: data.discharges?.[index]?.count || 0
  }));

  return (
    <div className="hospital-overview">
      <h3>Hospital Overview</h3>
      <p className="subtitle">Last 7 Days</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="OPD" stroke="#3b82f6" strokeWidth={2} />
          <Line type="monotone" dataKey="IPD" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="Admissions" stroke="#f59e0b" strokeWidth={2} />
          <Line type="monotone" dataKey="Discharges" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HospitalOverview;
