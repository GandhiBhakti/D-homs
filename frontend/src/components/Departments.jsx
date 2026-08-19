import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "./PageHeader";
import { departmentService } from "../services/departmentService";

const Departments = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await departmentService.getAllDepartments();
      setDepartments(data);
    } catch (err) {
      setError("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentDepartment(null);
    setShowModal(true);
  };

  const handleEdit = (department) => {
    setCurrentDepartment(department);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        await departmentService.deleteDepartment(id);
        fetchDepartments();
      } catch (err) {
        setError("Failed to delete department");
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
    <div className="departments-container">
      <PageHeader title="Departments Management" onLogout={handleLogout} />
      <div className="header">
        <button className="btn btn-primary" onClick={handleAdd}>
          Add Department
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((dept) => (
            <tr key={dept.id}>
              <td>{dept.id}</td>
              <td>{dept.name}</td>
              <td>{dept.description}</td>
              <td>{new Date(dept.created_at).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-sm btn-edit"
                  onClick={() => handleEdit(dept)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-delete"
                  onClick={() => handleDelete(dept.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <DepartmentModal
          department={currentDepartment}
          onClose={() => setShowModal(false)}
          onSave={fetchDepartments}
        />
      )}
    </div>
  );
};

const DepartmentModal = ({ department, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    department || {
      name: "",
      description: "",
    },
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (department) {
        await departmentService.updateDepartment(department.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      alert("Failed to save department");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{department ? "Edit Department" : "Add Department"}</h3>
          <button onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows="4"
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

export default Departments;
