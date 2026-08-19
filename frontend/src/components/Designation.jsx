import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from './PageHeader';
import { departmentService } from '../services/departmentService';
import { designationService } from '../services/designationService';

const Designation = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [currentDesignation, setCurrentDesignation] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptsData, designationsData] = await Promise.all([
                departmentService.getAllDepartments(),
                designationService.getAllDesignations()
            ]);
            setDepartments(deptsData);
            setDesignations(designationsData);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setCurrentDesignation(null);
        setShowModal(true);
    };

    const handleEdit = (designation) => {
        setCurrentDesignation(designation);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this designation?')) {
            try {
                await designationService.deleteDesignation(id);
                fetchData();
            } catch (err) {
                setError(err.message || 'Failed to delete designation');
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
        <div className="designation-container">
            <PageHeader title="Designations Management" onLogout={handleLogout} />
            <div className="header">
                <button className="btn btn-primary" onClick={handleAdd}>Add Designation</button>
            </div>
            
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Department</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {designations.map(designation => (
                        <tr key={designation.id}>
                            <td>{designation.id}</td>
                            <td>{designation.title}</td>
                            <td>{designation.department_name}</td>
                            <td>{designation.description}</td>
                            <td>
                                <button className="btn btn-sm btn-edit" onClick={() => handleEdit(designation)}>Edit</button>
                                <button className="btn btn-sm btn-delete" onClick={() => handleDelete(designation.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <DesignationModal 
                    designation={currentDesignation} 
                    departments={departments}
                    onClose={() => setShowModal(false)} 
                    onSave={fetchData}
                />
            )}
        </div>
    );
};

const DesignationModal = ({ designation, departments, onClose, onSave }) => {
    const [formData, setFormData] = useState(designation || {
        title: '',
        department_id: '',
        description: ''
    });
    const [submitError, setSubmitError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError(null);
        try {
            if (designation) {
                await designationService.updateDesignation(designation.id, formData);
            } else {
                await designationService.createDesignation(formData);
            }
            onSave();
            onClose();
        } catch (err) {
            setSubmitError(err.message || 'Failed to save designation');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <div className="modal-header">
                    <h3>{designation ? 'Edit Designation' : 'Add Designation'}</h3>
                    <button onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {submitError && <div className="error">{submitError}</div>}
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Department</label>
                        <select
                            value={formData.department_id}
                            onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                        >
                            <option value="">Select Department</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            rows="4"
                        />
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Designation;
