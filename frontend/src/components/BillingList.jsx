import React, { useEffect, useState } from "react";
import API_BASE_URL from "../config/api";

function BillingList({ searchQuery = "" }) {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  useEffect(() => {
    const loadBills = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/billing`);
        const data = await response.json();
        setBills(data);
      } catch (err) {
        setError(err.message || "Unable to load bills");
      } finally {
        setLoading(false);
      }
    };

    loadBills();
  }, []);

  const filteredBills = bills.filter((bill) => {
    const keyword = searchQuery.toLowerCase();
    const fullName = `${bill.first_name || ""} ${bill.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(keyword) ||
      (bill.phone || "").includes(keyword) ||
      (bill.bill_type || "").toLowerCase().includes(keyword) ||
      (bill.patient_id || "").toLowerCase().includes(keyword)
    );
  });

  const handlePayment = (bill) => {
    setSelectedBill(bill);
    setPaymentAmount("");
    setShowPaymentModal(true);
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!selectedBill || !paymentAmount) return;

    try {
      const response = await fetch(`${API_BASE_URL}/billing/${selectedBill.id}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid_amount: parseFloat(paymentAmount) }),
      });

      if (response.ok) {
        const result = await response.json();
        setBills(bills.map(b => 
          b.id === selectedBill.id 
            ? { ...b, paid_amount: result.newPaidAmount, status: result.status }
            : b
        ));
        setShowPaymentModal(false);
        setSelectedBill(null);
      } else {
        setError("Failed to process payment");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid": return "status-success";
      case "partial": return "status-warning";
      case "pending": return "status-danger";
      default: return "status";
    }
  };

  if (loading) {
    return <div className="loading">Loading billing list...</div>;
  }

  return (
    <div className="opd-page-card">
      <div className="page-header">
        <div>
          <h2>Billing Management</h2>
          <p>Manage all bills and payments.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill ID</th>
              <th>Patient</th>
              <th>Type</th>
              <th>Date</th>
              <th>Total Amount</th>
              <th>Paid</th>
              <th>Discount</th>
              <th>Pending</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill.id}>
                <td>#{bill.id}</td>
                <td>
                  {bill.first_name} {bill.last_name}
                  {bill.patient_id && <small className="text-muted"> ({bill.patient_id})</small>}
                </td>
                <td>{bill.bill_type}</td>
                <td>{bill.bill_date}</td>
                <td>₹{(bill.total_amount || 0).toLocaleString()}</td>
                <td className="text-success">₹{(bill.paid_amount || 0).toLocaleString()}</td>
                <td>₹{(bill.discount_amount || 0).toLocaleString()}</td>
                <td className="text-warning">₹{((bill.total_amount || 0) - (bill.paid_amount || 0)).toLocaleString()}</td>
                <td>
                  <span className={getStatusClass(bill.status)}>
                    {bill.status?.toUpperCase() || "PENDING"}
                  </span>
                </td>
                <td>
                  {bill.status !== "paid" && (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handlePayment(bill)}
                    >
                      Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPaymentModal && selectedBill && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Process Payment</h3>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>×</button>
            </div>
            <form onSubmit={submitPayment}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Patient</label>
                  <input
                    type="text"
                    value={`${selectedBill.first_name} ${selectedBill.last_name}`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Total Amount</label>
                  <input
                    type="text"
                    value={`₹${selectedBill.total_amount?.toLocaleString()}`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Already Paid</label>
                  <input
                    type="text"
                    value={`₹${selectedBill.paid_amount?.toLocaleString()}`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Pending Amount</label>
                  <input
                    type="text"
                    value={`₹${(selectedBill.total_amount - selectedBill.paid_amount).toLocaleString()}`}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label>Payment Amount</label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={selectedBill.total_amount - selectedBill.paid_amount}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Process Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BillingList;
