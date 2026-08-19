import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import { patientService } from "../services/patientService";
import "./Patients.css";

const Patients = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [bloodGroupFilter, setBloodGroupFilter] = useState("all");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getAllPatients();
      setPatients(data);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError(err.message || "Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentPatient(null);
    setShowModal(true);
  };

  const handleEdit = (patient) => {
    setCurrentPatient(patient);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await patientService.deletePatient(id);
        fetchPatients();
      } catch (err) {
        setError("Failed to delete patient");
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const extractCity = (address) => {
    if (!address) return 'N/A';
    const addressParts = address.split(',').map(part => part.trim());
    return addressParts[addressParts.length - 1] || 'N/A';
  };

  // Calculate blood group counts
  const bloodGroupCounts = patients.reduce((acc, patient) => {
    const bloodGroup = patient.blood_group || 'Unknown';
    acc[bloodGroup] = (acc[bloodGroup] || 0) + 1;
    return acc;
  }, {});

  // Filter patients
  const filteredPatients = patients.filter(patient => {
    const bloodGroupMatch = bloodGroupFilter === 'all' || patient.blood_group === bloodGroupFilter;
    return bloodGroupMatch;
  });

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="patients-container">
      <PageHeader title="Patients Management" onLogout={handleLogout} />
      <div className="header">
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Patient
        </button>
      </div>

      <div className="filter-section">
        <div className="filter-group">
          <h4>Blood Group</h4>
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${bloodGroupFilter === 'all' ? 'active' : ''}`}
              onClick={() => setBloodGroupFilter('all')}
            >
              All ({patients.length})
            </button>
            {Object.keys(bloodGroupCounts).sort().map(bloodGroup => (
              <button 
                key={bloodGroup}
                className={`filter-btn ${bloodGroupFilter === bloodGroup ? 'active' : ''}`}
                onClick={() => setBloodGroupFilter(bloodGroup)}
              >
                {bloodGroup} ({bloodGroupCounts[bloodGroup]})
              </button>
            ))}
          </div>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>UHID</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Mobile</th>
            <th>City</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredPatients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.patient_id}</td>
              <td>
                {patient.first_name} {patient.last_name}
              </td>
              <td>{patient.age || 'N/A'}</td>
              <td>{patient.gender || 'N/A'}</td>
              <td>{patient.email || 'N/A'}</td>
              <td>{patient.phone || 'N/A'}</td>
              <td>{extractCity(patient.address)}</td>
              <td>
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => handleEdit(patient)}
                >
                  Edit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => handleDelete(patient.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <PatientModal
          patient={currentPatient}
          onClose={() => setShowModal(false)}
          onSave={fetchPatients}
        />
      )}
    </div>
  );
};

const PatientModal = ({ patient, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    patient || {
      patient_id: "",
      first_name: "",
      last_name: "",
      date_of_birth: "",
      gender: "male",
      phone: "",
      email: "",
      address: "",
      blood_group: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (patient) {
        await patientService.updatePatient(patient.id, formData);
      } else {
        await patientService.createPatient(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save patient");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{patient ? "Edit Patient" : "Add Patient"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Patient ID (UHID)</label>
            <input
              type="text"
              value={formData.patient_id}
              onChange={(e) =>
                setFormData({ ...formData, patient_id: e.target.value })
              }
              required
            />
          </div>
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
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) =>
                setFormData({ ...formData, date_of_birth: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows="3"
            />
          </div>
          <div className="form-group">
            <label>Blood Group</label>
            <input
              type="text"
              value={formData.blood_group}
              onChange={(e) =>
                setFormData({ ...formData, blood_group: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Name</label>
            <input
              type="text"
              value={formData.emergency_contact_name}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_name: e.target.value })
              }
            />
          </div>
          <div className="form-group">
            <label>Emergency Contact Phone</label>
            <input
              type="text"
              value={formData.emergency_contact_phone}
              onChange={(e) =>
                setFormData({ ...formData, emergency_contact_phone: e.target.value })
              }
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

export default Patients;
