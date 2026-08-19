import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../services/prescriptionService';
import { doctorService } from '../services/doctorService';
import { useAuth } from '../contexts/AuthContext';
import PrescriptionForm from './PrescriptionForm';

const PrescriptionList = ({ searchQuery }) => {
    const { user, isDoctor, isAdmin } = useAuth();
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Filters
    const [filterDoctor, setFilterDoctor] = useState('');
    const [filterDateFrom, setFilterDateFrom] = useState('');
    const [filterDateTo, setFilterDateTo] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, daily, custom

    useEffect(() => {
        fetchDoctors();
        fetchPrescriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchPrescriptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterDoctor, filterDateFrom, filterDateTo, filterType]);

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getAllDoctors();
            setDoctors(data);
        } catch (err) {
            console.error('Failed to fetch doctors');
        }
    };

    const fetchPrescriptions = async () => {
        try {
            setLoading(true);
            setError(null);
            const filters = {};
            
            // If doctor is logged in, only show their prescriptions
            if (isDoctor() && user?.doctor_id) {
                filters.doctor_id = user.doctor_id;
            } else if (filterDoctor) {
                filters.doctor_id = filterDoctor;
            }

            // Apply date filters
            if (filterType === 'daily') {
                const today = new Date().toISOString().split('T')[0];
                filters.date_from = today;
                filters.date_to = today;
            } else if (filterType === 'custom') {
                if (filterDateFrom) filters.date_from = filterDateFrom;
                if (filterDateTo) filters.date_to = filterDateTo;
            }

            console.log('Fetching prescriptions with filters:', filters);
            const data = await prescriptionService.getAllPrescriptions(filters);
            console.log('Prescriptions data:', data);
            setPrescriptions(data);
        } catch (err) {
            console.error('Error fetching prescriptions:', err);
            setError(err.message || 'Failed to fetch prescriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleView = (prescription) => {
        setSelectedPrescription(prescription);
        setShowModal(true);
    };

    const handlePrint = (prescription) => {
        setSelectedPrescription(prescription);
        setShowPrintModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this prescription?')) {
            try {
                await prescriptionService.deletePrescription(id);
                fetchPrescriptions();
            } catch (err) {
                setError('Failed to delete prescription');
            }
        }
    };

    const handlePrintDocument = () => {
        const printContent = document.getElementById('print-prescription');
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Prescription - ${selectedPrescription?.patient_first_name} ${selectedPrescription?.patient_last_name}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                        .hospital-name { font-size: 24px; font-weight: bold; color: #e63946; }
                        .section { margin-bottom: 15px; }
                        .label { font-weight: bold; }
                        .value { margin-left: 10px; }
                        .prescription-details { white-space: pre-wrap; line-height: 1.6; }
                        .footer { margin-top: 30px; border-top: 1px solid #000; padding-top: 10px; text-align: center; }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
        setShowPrintModal(false);
    };

    const searchTerm = (searchQuery || '').toLowerCase().trim();
    const filteredPrescriptions = prescriptions.filter(prescription => {
        const text = [
            prescription.id,
            prescription.patient_first_name,
            prescription.patient_last_name,
            prescription.doctor_first_name,
            prescription.doctor_last_name,
            prescription.diagnosis,
            prescription.visit_type
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
        return !searchTerm || text.includes(searchTerm);
    });

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="prescription-list-container">
            <div className="header">
                <h2>Prescriptions</h2>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    Add Prescription
                </button>
                <button className="btn btn-secondary" onClick={() => fetchPrescriptions()}>
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="filters">
                <div className="form-row">
                    {(isAdmin() || isDoctor()) && (
                        <div className="form-group">
                            <label>Filter Type</label>
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="all">All</option>
                                <option value="daily">Today</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>
                    )}
                    
                    {filterType === 'custom' && (
                        <>
                            <div className="form-group">
                                <label>From Date</label>
                                <input
                                    type="date"
                                    value={filterDateFrom}
                                    onChange={(e) => setFilterDateFrom(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>To Date</label>
                                <input
                                    type="date"
                                    value={filterDateTo}
                                    onChange={(e) => setFilterDateTo(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {isAdmin() && (
                        <div className="form-group">
                            <label>Doctor</label>
                            <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)}>
                                <option value="">All Doctors</option>
                                {doctors.map(doctor => (
                                    <option key={doctor.id} value={doctor.id}>
                                        Dr. {doctor.first_name} {doctor.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Patient</th>
                        <th>Doctor</th>
                        <th>Visit Type</th>
                        <th>Diagnosis</th>
                        <th>Date</th>
                        <th>Total (₹)</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredPrescriptions.map(prescription => (
                        <tr key={prescription.id}>
                            <td>{prescription.id}</td>
                            <td>
                                {prescription.patient_first_name} {prescription.patient_last_name}
                            </td>
                            <td>
                                Dr. {prescription.doctor_first_name} {prescription.doctor_last_name}
                            </td>
                            <td>{prescription.visit_type}</td>
                            <td>{prescription.diagnosis?.substring(0, 50)}...</td>
                            <td>{new Date(prescription.created_at).toLocaleDateString()}</td>
                            <td>₹{prescription.total_amount}</td>
                            <td>
                                <button
                                    className="btn btn-sm btn-edit"
                                    onClick={() => handleView(prescription)}
                                >
                                    View
                                </button>
                                <button
                                    className="btn btn-sm"
                                    onClick={() => handlePrint(prescription)}
                                >
                                    Print
                                </button>
                                <button
                                    className="btn btn-sm btn-delete"
                                    onClick={() => handleDelete(prescription.id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {filteredPrescriptions.length === 0 && (
                <div className="no-data" style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <p>No prescriptions found.</p>
                    <p>Click "Add Prescription" to create a new prescription.</p>
                </div>
            )}

            {/* View Modal */}
            {showModal && selectedPrescription && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h3>Prescription Details</h3>
                            <button onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div className="prescription-details">
                            <div className="section">
                                <strong>Patient:</strong> {selectedPrescription.patient_first_name} {selectedPrescription.patient_last_name}
                            </div>
                            <div className="section">
                                <strong>Doctor:</strong> Dr. {selectedPrescription.doctor_first_name} {selectedPrescription.doctor_last_name}
                            </div>
                            <div className="section">
                                <strong>Visit Type:</strong> {selectedPrescription.visit_type}
                            </div>
                            <div className="section">
                                <strong>Date:</strong> {new Date(selectedPrescription.created_at).toLocaleString()}
                            </div>
                            <div className="section">
                                <strong>Chief Complaint:</strong>
                                <p>{selectedPrescription.chief_complaint}</p>
                            </div>
                            <div className="section">
                                <strong>Diagnosis:</strong>
                                <p>{selectedPrescription.diagnosis}</p>
                            </div>
                            <div className="section">
                                <strong>Prescription:</strong>
                                <p className="prescription-details">{selectedPrescription.prescription_details}</p>
                            </div>
                            {selectedPrescription.lab_tests && (
                                <div className="section">
                                    <strong>Lab Tests:</strong>
                                    <p>{selectedPrescription.lab_tests}</p>
                                </div>
                            )}
                            {selectedPrescription.xray_tests && (
                                <div className="section">
                                    <strong>X-Ray Tests:</strong>
                                    <p>{selectedPrescription.xray_tests}</p>
                                </div>
                            )}
                            {selectedPrescription.other_tests && (
                                <div className="section">
                                    <strong>Other Tests:</strong>
                                    <p>{selectedPrescription.other_tests}</p>
                                </div>
                            )}
                            <div className="section">
                                <strong>Fees:</strong>
                                <p>Consultation: ₹{selectedPrescription.consultation_fee}</p>
                                <p>Lab: ₹{selectedPrescription.lab_fee}</p>
                                <p>X-Ray: ₹{selectedPrescription.xray_fee}</p>
                                <p>Other: ₹{selectedPrescription.other_fee}</p>
                                <p><strong>Total: ₹{selectedPrescription.total_amount}</strong></p>
                            </div>
                            {selectedPrescription.follow_up_date && (
                                <div className="section">
                                    <strong>Follow-up Date:</strong> {new Date(selectedPrescription.follow_up_date).toLocaleDateString()}
                                </div>
                            )}
                            {selectedPrescription.notes && (
                                <div className="section">
                                    <strong>Notes:</strong>
                                    <p>{selectedPrescription.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Modal */}
            {showPrintModal && selectedPrescription && (
                <div className="modal-overlay">
                    <div className="modal modal-lg">
                        <div className="modal-header">
                            <h3>Print Prescription</h3>
                            <button onClick={() => setShowPrintModal(false)}>&times;</button>
                        </div>
                        <div id="print-prescription" className="print-prescription">
                            <div className="header">
                                <div className="hospital-name">DIVINE MULTI SPECIALITY HOSPITAL</div>
                                <div>Doctor Consultation Prescription</div>
                            </div>
                            <div className="section">
                                <span className="label">Patient:</span>
                                <span className="value">{selectedPrescription.patient_first_name} {selectedPrescription.patient_last_name}</span>
                            </div>
                            <div className="section">
                                <span className="label">Date:</span>
                                <span className="value">{new Date(selectedPrescription.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="section">
                                <span className="label">Doctor:</span>
                                <span className="value">Dr. {selectedPrescription.doctor_first_name} {selectedPrescription.doctor_last_name}</span>
                            </div>
                            <div className="section">
                                <span className="label">Chief Complaint:</span>
                                <span className="value">{selectedPrescription.chief_complaint}</span>
                            </div>
                            <div className="section">
                                <span className="label">Diagnosis:</span>
                                <span className="value">{selectedPrescription.diagnosis}</span>
                            </div>
                            <div className="section">
                                <span className="label">Prescription:</span>
                                <div className="value prescription-details">{selectedPrescription.prescription_details}</div>
                            </div>
                            {selectedPrescription.lab_tests && (
                                <div className="section">
                                    <span className="label">Lab Tests:</span>
                                    <span className="value">{selectedPrescription.lab_tests}</span>
                                </div>
                            )}
                            {selectedPrescription.xray_tests && (
                                <div className="section">
                                    <span className="label">X-Ray Tests:</span>
                                    <span className="value">{selectedPrescription.xray_tests}</span>
                                </div>
                            )}
                            {selectedPrescription.follow_up_date && (
                                <div className="section">
                                    <span className="label">Follow-up Date:</span>
                                    <span className="value">{new Date(selectedPrescription.follow_up_date).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div className="footer">
                                <div>Consultation Fee: ₹{selectedPrescription.consultation_fee}</div>
                                <div>Total Amount: ₹{selectedPrescription.total_amount}</div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowPrintModal(false)}>Cancel</button>
                            <button onClick={handlePrintDocument}>Print</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Prescription Modal */}
            {showAddModal && (
                <PrescriptionForm
                    onSuccess={() => {
                        fetchPrescriptions();
                        setShowAddModal(false);
                    }}
                    onCancel={() => setShowAddModal(false)}
                />
            )}
        </div>
    );
};

export default PrescriptionList;
