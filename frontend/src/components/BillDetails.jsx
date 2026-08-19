import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import PageHeader from "./PageHeader";
import API_BASE_URL from "../config/api";
import "./BillDetails.css";

function BillDetails() {
  const navigate = useNavigate();
  const { user, logout, isDoctor, isAdmin, isStaff } = useAuth();
  const [bills, setBills] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("bills");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [doctorFilter, setDoctorFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [consultationType, setConsultationType] = useState("all");

  useEffect(() => {
    if (activeTab === "bills") {
      fetchBills();
    } else {
      fetchPrescriptions();
    }
  }, [activeTab, doctorFilter, dateFrom, dateTo, consultationType]);

  const fetchBills = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/billing`);
      const data = await response.json();
      setBills(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch bills:", err);
      setBills([]);
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("access_token");
      let url = `${API_BASE_URL}/prescriptions`;
      const params = new URLSearchParams();
      
      if (isDoctor() && user?.doctor_id) {
        params.append("doctor_id", user.doctor_id);
      }
      if (doctorFilter) {
        params.append("doctor_id", doctorFilter);
      }
      if (dateFrom) {
        params.append("date_from", dateFrom);
      }
      if (dateTo) {
        params.append("date_to", dateTo);
      }
      if (consultationType !== "all") {
        params.append("consultation_type", consultationType);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPrescriptions(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      setPrescriptions([]);
      setLoading(false);
    }
  };

  const handlePrint = (billId) => {
    window.print();
  };

  const handlePrintPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowPrescriptionModal(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.patient_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.bill_number?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      filterStatus === "all" || bill.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="bill-details">
      <PageHeader title="Bill Details & Prescriptions" onLogout={handleLogout} />
      
      <div className="tabs">
        <button
          className={`tab ${activeTab === "bills" ? "active" : ""}`}
          onClick={() => setActiveTab("bills")}
        >
          Bills
        </button>
        <button
          className={`tab ${activeTab === "prescriptions" ? "active" : ""}`}
          onClick={() => setActiveTab("prescriptions")}
        >
          Prescriptions
        </button>
      </div>

      {activeTab === "bills" ? (
        <>
          <div className="bill-details-header">
            <h2>Bill Details</h2>
            <p>View and manage patient billing information</p>
          </div>

          <div className="bill-filters">
            <input
              type="search"
              placeholder="Search by patient, ID, or bill number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bill Number</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Bill Date</th>
                  <th>Bill Type</th>
                  <th>Total Amount</th>
                  <th>Paid Amount</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_number}</td>
                      <td>{bill.patient_name}</td>
                      <td>{bill.patient_id}</td>
                      <td>{new Date(bill.bill_date).toLocaleDateString()}</td>
                      <td>{bill.bill_type}</td>
                      <td>₹{bill.total_amount?.toLocaleString()}</td>
                      <td>₹{bill.paid_amount?.toLocaleString()}</td>
                      <td>₹{(bill.total_amount - bill.paid_amount)?.toLocaleString()}</td>
                      <td>
                        <span className={`status ${bill.status}`}>
                          {bill.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-print"
                          onClick={() => handlePrint(bill.id)}
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="no-data">
                      No bills found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="bill-details-header">
            <h2>Prescriptions</h2>
            <p>View and manage patient prescriptions</p>
          </div>

          <div className="prescription-filters">
            {(isAdmin() || isStaff()) && (
              <input
                type="text"
                placeholder="Filter by Doctor ID..."
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="search-input"
              />
            )}
            <input
              type="date"
              placeholder="From Date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="search-input"
            />
            <input
              type="date"
              placeholder="To Date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="search-input"
            />
            <select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="opd">OPD</option>
              <option value="lab">Lab</option>
              <option value="xray">X-Ray</option>
            </select>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Patient ID</th>
                  <th>Doctor</th>
                  <th>Consultation Type</th>
                  <th>Diagnosis</th>
                  <th>Medicines</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.length > 0 ? (
                  prescriptions.map((prescription) => (
                    <tr key={prescription.id}>
                      <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                      <td>{prescription.patient_name}</td>
                      <td>{prescription.patient_id}</td>
                      <td>{prescription.doctor_name}</td>
                      <td>
                        <span className={`consultation-type ${prescription.consultation_type}`}>
                          {prescription.consultation_type?.toUpperCase() || 'OPD'}
                        </span>
                      </td>
                      <td>{prescription.diagnosis?.substring(0, 50)}...</td>
                      <td>{prescription.medicines?.substring(0, 50)}...</td>
                      <td>
                        <button
                          className="btn btn-sm btn-view"
                          onClick={() => {
                            setSelectedPrescription(prescription);
                            setShowPrescriptionModal(true);
                          }}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-print"
                          onClick={() => handlePrintPrescription(prescription)}
                        >
                          Print
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No prescriptions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showPrescriptionModal && selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-content prescription-modal">
            <div className="modal-header">
              <h3>Prescription Details</h3>
              <button
                className="close-button"
                onClick={() => setShowPrescriptionModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="prescription-details">
                <div className="detail-row">
                  <span className="label">Date:</span>
                  <span className="value">{new Date(selectedPrescription.created_at).toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Patient:</span>
                  <span className="value">{selectedPrescription.patient_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Patient ID:</span>
                  <span className="value">{selectedPrescription.patient_id}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Doctor:</span>
                  <span className="value">{selectedPrescription.doctor_name}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Consultation Type:</span>
                  <span className="value">{selectedPrescription.consultation_type?.toUpperCase() || 'OPD'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Diagnosis:</span>
                  <span className="value">{selectedPrescription.diagnosis}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Medicines:</span>
                  <span className="value">{selectedPrescription.medicines}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Notes:</span>
                  <span className="value">{selectedPrescription.notes || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowPrescriptionModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handlePrintPrescription(selectedPrescription)}
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillDetails;
