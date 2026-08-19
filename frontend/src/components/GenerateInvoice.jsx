import React, { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";
import "./GenerateInvoice.css";

function GenerateInvoice() {
  const [formData, setFormData] = useState({
    patient_id: "",
    bill_date: new Date().toISOString().split("T")[0],
    bill_type: "IPD",
    items: [
      { description: "", quantity: 1, rate: 0 },
    ],
    discount: 0,
    tax: 0,
    notes: "",
  });

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      const response = await fetch(`${API_BASE_URL}/patients`, { headers });
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setError("Failed to load patients");
      setPatients([]);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0 }],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.rate,
      0
    );
    const discountAmount = subtotal * (formData.discount / 100);
    const taxAmount = (subtotal - discountAmount) * (formData.tax / 100);
    return subtotal - discountAmount + taxAmount;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const invoiceData = {
      ...formData,
      total_amount: calculateTotal(),
      paid_amount: 0,
      status: "pending",
    };

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
      const response = await fetch(`${API_BASE_URL}/billing`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invoice generation failed");

      setMessage("Invoice generated successfully!");
      setFormData({
        patient_id: "",
        bill_date: new Date().toISOString().split("T")[0],
        bill_type: "IPD",
        items: [{ description: "", quantity: 1, rate: 0 }],
        discount: 0,
        tax: 0,
        notes: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="generate-invoice">
      <div className="generate-invoice-header">
        <h2>Generate Invoice</h2>
        <p>Create new invoice for patient billing</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      <form className="invoice-form" onSubmit={handleSubmit}>
        <div className="invoice-section">
          <h3>Patient Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Patient</label>
              <select
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.patient_id} - {patient.first_name} {patient.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Bill Date</label>
              <input
                type="date"
                name="bill_date"
                value={formData.bill_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Bill Type</label>
            <select
              name="bill_type"
              value={formData.bill_type}
              onChange={handleChange}
              required
            >
              <option value="IPD">IPD</option>
              <option value="OPD">OPD</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Laboratory">Laboratory</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="invoice-section">
          <h3>Bill Items</h3>
          <div className="items-list">
            {formData.items.map((item, index) => (
              <div key={index} className="item-row">
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Service/Item description"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.rate}
                    onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={`₹${(item.quantity * item.rate).toFixed(2)}`}
                    disabled
                    className="amount-field"
                  />
                </div>
                {formData.items.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-remove"
                    onClick={() => removeItem(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-secondary" onClick={addItem}>
            + Add Item
          </button>
        </div>

        <div className="invoice-section">
          <h3>Tax & Discount</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Discount (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Tax (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                name="tax"
                value={formData.tax}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="invoice-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>₹{formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Discount:</span>
            <span>-₹{(formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0) * (formData.discount / 100)).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax:</span>
            <span>+₹{((formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0) * (1 - formData.discount / 100)) * (formData.tax / 100)).toFixed(2)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span>₹{calculateTotal().toFixed(2)}</span>
          </div>
        </div>

        <div className="form-group">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Generate Invoice
        </button>
      </form>
    </div>
  );
}

export default GenerateInvoice;
