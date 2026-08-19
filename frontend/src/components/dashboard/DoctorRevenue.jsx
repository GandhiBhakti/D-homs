import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function DoctorRevenue() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("chart"); // chart or table

  const COLORS = ["#3498db", "#2ecc71", "#9b59b6", "#e74c3c", "#f39c12", "#1abc9c", "#34495e", "#e67e22", "#95a5a6", "#16a085"];

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/dashboard/doctor-revenue");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Unable to load doctor revenue data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading doctor revenue...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const totalRevenue = data.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  const totalCollected = data.reduce((sum, item) => sum + (item.collected_revenue || 0), 0);
  const totalPending = data.reduce((sum, item) => sum + (item.pending_revenue || 0), 0);
  const totalVisits = data.reduce((sum, item) => sum + (item.total_visits || 0), 0);

  const pieData = data.slice(0, 5).map((item, index) => ({
    name: item.doctor_name,
    value: item.total_revenue,
  }));

  return (
    <div className="revenue-overview">
      <div className="card-header">
        <h3>Doctor-wise Revenue</h3>
        <div className="view-toggle">
          <button
            className={`btn btn-sm ${view === "chart" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("chart")}
          >
            Chart
          </button>
          <button
            className={`btn btn-sm ${view === "table" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setView("table")}
          >
            Table
          </button>
        </div>
      </div>

      <div className="revenue-summary">
        <div className="summary-item">
          <span className="label">Total Revenue</span>
          <span className="value">₹{totalRevenue.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Collected</span>
          <span className="value text-success">₹{totalCollected.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Pending</span>
          <span className="value text-warning">₹{totalPending.toLocaleString()}</span>
        </div>
        <div className="summary-item">
          <span className="label">Total Visits</span>
          <span className="value">{totalVisits}</span>
        </div>
      </div>

      {view === "chart" ? (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctor_name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_revenue" fill="#3498db" name="Total Revenue" />
              <Bar dataKey="collected_revenue" fill="#2ecc71" name="Collected" />
              <Bar dataKey="pending_revenue" fill="#e74c3c" name="Pending" />
            </BarChart>
          </ResponsiveContainer>

          <h4 className="chart-subtitle">Revenue Distribution (Top 5 Doctors)</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ₹${entry.value.toLocaleString()}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Visits</th>
                <th>Bills</th>
                <th>Total Revenue</th>
                <th>Collected</th>
                <th>Pending</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.doctor_name}</td>
                  <td>{item.specialization || "-"}</td>
                  <td>{item.department_name || "-"}</td>
                  <td>{item.total_visits || 0}</td>
                  <td>{item.total_bills || 0}</td>
                  <td>₹{(item.total_revenue || 0).toLocaleString()}</td>
                  <td className="text-success">₹{(item.collected_revenue || 0).toLocaleString()}</td>
                  <td className="text-warning">₹{(item.pending_revenue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DoctorRevenue;
