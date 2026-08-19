import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import API_BASE_URL from "../config/api";
import "./ReceptionistDashboard.css";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  useEffect(() => {
    fetchKpiData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
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

      {/* Date Filter */}
      <div className="date-filter-container">
        <div className="date-pickers">
          <div className="date-picker-group">
            <label>FROM</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-picker-group">
            <label>TO</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>
        <div className="quick-date-buttons">
          <button className="quick-date-btn" onClick={() => handleDateFilter('today')}>Today</button>
          <button className="quick-date-btn" onClick={() => handleDateFilter('yesterday')}>Yesterday</button>
          <button className="quick-date-btn" onClick={() => handleDateFilter('thisWeek')}>This Week</button>
          <button className="quick-date-btn" onClick={() => handleDateFilter('thisMonth')}>This Month</button>
          <button className="quick-date-btn" onClick={() => handleDateFilter('last30Days')}>Last 30 Days</button>
        </div>
      </div>

      {/* Date Display */}
      <div className="date-display">
        <span className="date-label">KPI for {formatDate(fromDate)}</span>
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
    </div>
  );
};

export default ReceptionistDashboard;
