import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import { doctorService } from "../services/doctorService";

const DoctorAvailability = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [availabilities, setAvailabilities] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const doctorsData = await doctorService.getAllDoctors();
      setDoctors(doctorsData);
    } catch (err) {
      setError("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedDoctor || !selectedDate) {
      alert("Please select doctor and date");
      return;
    }
    // Fetch availability for specific doctor and date
    // This would need to be implemented in the backend
  };

  const handleAdd = () => {
    setCurrentAvailability(null);
    setShowModal(true);
  };

  const handleEdit = (availability) => {
    setCurrentAvailability(availability);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this availability?")) {
      try {
        // Delete logic here
        fetchDoctors();
      } catch (err) {
        setError("Failed to delete availability");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="availability-container">
      <PageHeader title="Doctor Availability" onLogout={handleLogout} />
      <div className="header">
        <h2>Doctor Availability</h2>
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Availability
        </button>
      </div>

      <div className="filters">
        <div className="form-row">
          <div className="form-group">
            <label>Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {availabilities.map((availability) => (
            <tr key={availability.id}>
              <td>{availability.id}</td>
              <td>{availability.doctor_name}</td>
              <td>{new Date(availability.date).toLocaleDateString()}</td>
              <td>{availability.start_time}</td>
              <td>{availability.end_time}</td>
              <td>
                <span
                  className={`status ${availability.status === "available" ? "active" : "inactive"}`}
                >
                  {availability.status}
                </span>
              </td>
              <td>{availability.notes}</td>
              <td>
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => handleEdit(availability)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => handleDelete(availability.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <AvailabilityModal
          availability={currentAvailability}
          doctors={doctors}
          onClose={() => setShowModal(false)}
          onSave={() => {
            /* Refresh logic */
          }}
        />
      )}
    </div>
  );
};

const AvailabilityModal = ({ availability, doctors, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    availability || {
      doctor_id: "",
      date: "",
      start_time: "",
      end_time: "",
      status: "available",
      notes: "",
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Save logic here
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{availability ? "Edit Availability" : "Add Availability"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Doctor</label>
            <select
              value={formData.doctor_id}
              onChange={(e) =>
                setFormData({ ...formData, doctor_id: e.target.value })
              }
              required
            >
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.first_name} {doctor.last_name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows="3"
            />
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorAvailability;
