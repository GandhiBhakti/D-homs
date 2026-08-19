import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import { doctorService } from "../services/doctorService";
import { departmentService } from "../services/departmentService";
import API_BASE_URL from "../config/api";

const DoctorList = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctorAvailability, setDoctorAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentDoctor, setCurrentDoctor] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const [doctorsData, deptsData, availabilityData] = await Promise.all([
        doctorService.getAllDoctors(),
        departmentService.getAllDepartments(),
        fetch(`${API_BASE_URL}/receptionist/doctor-availability`, {
          headers,
        }).then((res) => res.json()),
      ]);

      setDoctors(doctorsData);
      setDepartments(deptsData);
      setDoctorAvailability(
        Array.isArray(availabilityData) ? availabilityData : [],
      );
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentDoctor(null);
    setShowModal(true);
  };

  const handleEdit = (doctor) => {
    setCurrentDoctor(doctor);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await doctorService.deleteDoctor(id);
        setError(null);
        fetchData();
      } catch (err) {
        setError(err.message || "Failed to delete doctor");
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="doctor-list-container">
      <PageHeader title="Doctor List" onLogout={handleLogout} />
      <div className="header">
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Doctor
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Specialization</th>
            <th>Qualification</th>
            <th>Experience</th>
            <th>Fee</th>
            <th>Status</th>
            <th>Available Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.map((doctor) => {
            const availability = doctorAvailability.find(
              (av) => av.id === doctor.id,
            );
            return (
              <tr key={doctor.id}>
                <td>{doctor.id}</td>
                <td>
                  {doctor.first_name} {doctor.last_name}
                </td>
                <td>{doctor.email}</td>
                <td>{doctor.phone}</td>
                <td>{doctor.department_name}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.qualification}</td>
                <td>{doctor.experience_years || "-"}</td>
                <td>₹{doctor.consultation_fee || doctor.visit_charges || 0}</td>
                <td>
                  <span
                    className={`status ${availability?.current_status === "In Hospital" ? "active" : availability?.current_status === "On Leave" ? "inactive" : doctor.is_available ? "active" : "inactive"}`}
                  >
                    {availability?.current_status ||
                      (doctor.is_available ? "Available" : "Unavailable")}
                  </span>
                </td>
                <td>
                  {availability?.available_start && availability?.available_end
                    ? `${new Date(`2000-01-01T${availability.available_start}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} - ${new Date(`2000-01-01T${availability.available_end}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`
                    : "-"}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-edit"
                    onClick={() => handleEdit(doctor)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-delete"
                    onClick={() => handleDelete(doctor.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showModal && (
        <DoctorModal
          doctor={currentDoctor}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSave={fetchData}
        />
      )}
    </div>
  );
};

const DoctorModal = ({ doctor, departments, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    doctor || {
      user_id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      mobile: "",
      department_id: "",
      designation_id: "",
      specialization: "",
      qualification: "",
      experience_years: "",
      consultation_fee: "",
      visit_charges: "",
      opd_commission: "",
      ipd_commission: "",
      ot_commission: "",
      is_available: true,
      is_active: true,
    },
  );

  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      if (doctor) {
        await doctorService.updateDoctor(doctor.id, formData);
      } else {
        await doctorService.createDoctor(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      setSubmitError(err.message || "Failed to save doctor");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3>{doctor ? "Edit Doctor" : "Add Doctor"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {submitError && <div className="error">{submitError}</div>}
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Mobile</label>
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData({ ...formData, mobile: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Department</label>
            <select
              value={formData.department_id}
              onChange={(e) =>
                setFormData({ ...formData, department_id: e.target.value })
              }
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Specialization</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({ ...formData, qualification: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: e.target.value })
                }
              />
            </div>
          </div>
          <div className="form-group">
            <label>Consultation Fee</label>
            <input
              type="number"
              step="0.01"
              value={formData.consultation_fee}
              onChange={(e) =>
                setFormData({ ...formData, consultation_fee: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Visit Charges</label>
            <input
              type="number"
              step="0.01"
              value={formData.visit_charges}
              onChange={(e) =>
                setFormData({ ...formData, visit_charges: e.target.value })
              }
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>OPD Commission</label>
              <input
                type="text"
                value={formData.opd_commission}
                onChange={(e) =>
                  setFormData({ ...formData, opd_commission: e.target.value })
                }
                placeholder="e.g., 100% OPD or 80% Doctor / 20% Hospital"
              />
            </div>
            <div className="form-group">
              <label>IPD Commission</label>
              <input
                type="text"
                value={formData.ipd_commission}
                onChange={(e) =>
                  setFormData({ ...formData, ipd_commission: e.target.value })
                }
                placeholder="e.g., Custom or 80% Doctor / 20% Hospital"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>OT Commission</label>
              <input
                type="text"
                value={formData.ot_commission}
                onChange={(e) =>
                  setFormData({ ...formData, ot_commission: e.target.value })
                }
                placeholder="e.g., Custom"
              />
            </div>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_available}
                onChange={(e) =>
                  setFormData({ ...formData, is_available: e.target.checked })
                }
              />
              Available
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
              />
              Active
            </label>
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

export default DoctorList;
