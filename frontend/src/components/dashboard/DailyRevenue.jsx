import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

function DailyRevenue() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("chart"); // chart or table

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/dashboard/daily-revenue");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message || "Unable to load daily revenue data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="loading">Loading daily revenue...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const totalRevenue = data.reduce((sum, item) => sum + (item.total_revenue || 0), 0);
  const totalCollected = data.reduce((sum, item) => sum + (item.collected_revenue || 0), 0);
  const totalPending = data.reduce((sum, item) => sum + (item.total_revenue - item.collected_revenue || 0), 0);

  return (
    <div className="revenue-overview">
      <div className="card-header">
        <h3>Daily Revenue Breakdown</h3>
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
      </div>

      {view === "chart" ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="total_revenue" stroke="#3498db" name="Total Revenue" />
            <Line type="monotone" dataKey="collected_revenue" stroke="#2ecc71" name="Collected" />
            <Line type="monotone" dataKey="opd_revenue" stroke="#9b59b6" name="OPD" />
            <Line type="monotone" dataKey="ipd_revenue" stroke="#e74c3c" name="IPD" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total Bills</th>
                <th>Total Revenue</th>
                <th>Collected</th>
                <th>Pending</th>
                <th>OPD</th>
                <th>IPD</th>
                <th>Pharmacy</th>
                <th>Lab</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item.date}</td>
                  <td>{item.total_bills}</td>
                  <td>₹{(item.total_revenue || 0).toLocaleString()}</td>
                  <td className="text-success">₹{(item.collected_revenue || 0).toLocaleString()}</td>
                  <td className="text-warning">₹{((item.total_revenue || 0) - (item.collected_revenue || 0)).toLocaleString()}</td>
                  <td>₹{(item.opd_revenue || 0).toLocaleString()}</td>
                  <td>₹{(item.ipd_revenue || 0).toLocaleString()}</td>
                  <td>₹{(item.pharmacy_revenue || 0).toLocaleString()}</td>
                  <td>₹{(item.lab_revenue || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DailyRevenue;
