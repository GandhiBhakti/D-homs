import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import "./Dashboard.css";

function Dashboard({ onNavigate, refreshKey }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [kpiData, setKpiData] = useState({
    opd: 0,
    ipd: 0,
    emergency: 0,
    discharges: 0,
    totalCollection: 0,
    advance: 0,
    refund: 0,
    bedOccupancy: { total: 18, capacity: 50, icu: 1, icuCapacity: 5 }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchKpiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, fromDate, toDate]);

  const fetchKpiData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(
        `${API_BASE_URL}/dashboard/kpi?from=${fromDate}&to=${toDate}`,
        { headers }
      );
      
      if (response.ok) {
        const data = await response.json();
        setKpiData(data);
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (filter) => {
    const today = new Date();
    let from = new Date();
    let to = new Date();

    switch (filter) {
      case 'today':
        from = today;
        to = today;
        break;
      case 'yesterday':
        from = new Date(today);
        from.setDate(today.getDate() - 1);
        to = from;
        break;
      case 'thisWeek':
        from = new Date(today);
        from.setDate(today.getDate() - today.getDay());
        to = today;
        break;
      case 'thisMonth':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = today;
        break;
      case 'last30Days':
        from = new Date(today);
        from.setDate(today.getDate() - 30);
        to = today;
        break;
      default:
        break;
    }

    setFromDate(from.toISOString().split('T')[0]);
    setToDate(to.toISOString().split('T')[0]);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/opd/list?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getChartData = () => {
    return [
      { name: 'OPD', value: kpiData.opd },
      { name: 'IPD', value: kpiData.ipd },
      { name: 'Emergency', value: kpiData.emergency },
      { name: 'Discharges', value: kpiData.discharges },
      { name: 'Collection', value: kpiData.totalCollection }
    ];
  };

  const COLORS = ['#667eea', '#764ba2', '#ef4444', '#10b981', '#f59e0b'];

  const renderChart = () => {
    const data = getChartData();

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#667eea" strokeWidth={2} name="Count" />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#667eea" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6} name="Count" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                name="Count"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        {/* Dashboard Title */}
        <div className="dashboard-title">
          <h1>Hospital Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>

        {/* Date and Actions Row */}
        <div className="dashboard-date-actions">
          <div className="today-date">
            <span className="date-label">Today's Date:</span>
            <span className="date-value">{getTodayDate()}</span>
          </div>

          <div className="action-buttons-container">
            <button className="action-button" onClick={() => navigate('/opd/registration')}>+ New Patient</button>
            <button className="action-button" onClick={() => navigate('/opd/list')}>+ OPD</button>
            <button className="action-button" onClick={() => navigate('/ipd/list')}>+ IPD</button>
            <button className="action-button emergency" onClick={() => navigate('/emergency')}>+ Emergency</button>
          </div>
        </div>


        {/* KPI Cards */}
        <div className="kpi-cards-grid">
          <div className="kpi-card">
            <div className="kpi-icon">📋</div>
            <div className="kpi-info">
              <div className="kpi-label">OPD</div>
              <div className="kpi-value">{kpiData.opd}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🛏️</div>
            <div className="kpi-info">
              <div className="kpi-label">IPD</div>
              <div className="kpi-value">{kpiData.ipd}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🚑</div>
            <div className="kpi-info">
              <div className="kpi-label">EMERGENCY</div>
              <div className="kpi-value">{kpiData.emergency}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">📈</div>
            <div className="kpi-info">
              <div className="kpi-label">DISCHARGES</div>
              <div className="kpi-value">{kpiData.discharges}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">💰</div>
            <div className="kpi-info">
              <div className="kpi-label">TOTAL COLLECTION</div>
              <div className="kpi-value">₹{kpiData.totalCollection.toLocaleString()}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">💼</div>
            <div className="kpi-info">
              <div className="kpi-label">ADVANCE</div>
              <div className="kpi-value">₹{kpiData.advance.toLocaleString()}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">💳</div>
            <div className="kpi-info">
              <div className="kpi-label">REFUND</div>
              <div className="kpi-value">₹{kpiData.refund.toLocaleString()}</div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🏥</div>
            <div className="kpi-info">
              <div className="kpi-label">BED OCCUPANCY</div>
              <div className="kpi-value">{kpiData.bedOccupancy.total}/{kpiData.bedOccupancy.capacity}</div>
              <div className="kpi-subvalue">ICU {kpiData.bedOccupancy.icu}/{kpiData.bedOccupancy.icuCapacity}</div>
            </div>
          </div>
        </div>

        {/* Graph and Short Actions Section */}
        <div className="dashboard-graph-actions">
          <div className="graph-section">
            <div className="graph-header">
              <h3>Revenue Overview</h3>
              <select
                className="chart-type-selector"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="area">Area Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
            {renderChart()}
          </div>

          <div className="short-actions-section">
            <h3>Quick Actions</h3>
            <div className="short-actions-grid">
              <button className="short-action-btn" onClick={() => navigate('/opd/registration')}>
                <span className="action-icon">➕</span>
                <span>New Patient</span>
              </button>
              <button className="short-action-btn" onClick={() => navigate('/billing')}>
                <span className="action-icon">💳</span>
                <span>Billing</span>
              </button>
              <button className="short-action-btn" onClick={() => navigate('/ipd/bill-details')}>
                <span className="action-icon">📊</span>
                <span>Reports</span>
              </button>
              <button className="short-action-btn" onClick={() => navigate('/admin/doctors')}>
                <span className="action-icon">👨‍⚕️</span>
                <span>Doctors</span>
              </button>
              <button className="short-action-btn" onClick={() => navigate('/ipd/registration')}>
                <span className="action-icon">🛏️</span>
                <span>Admission</span>
              </button>
              <button className="short-action-btn" onClick={() => navigate('/ipd/discharge-form')}>
                <span className="action-icon">📤</span>
                <span>Discharge</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
