import React, { useState, useEffect } from 'react';
import { prescriptionService } from '../services/prescriptionService';
import { doctorService } from '../services/doctorService';

const PrescriptionForm = ({ patientId, visitType, visitId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        patient_id: patientId || '',
        patient_name: '',
        doctor_id: '',
        visit_type: visitType || 'OPD',
        visit_id: visitId || '',
        chief_complaint: '',
        diagnosis: '',
        prescription_details: '',
        lab_tests: '',
        xray_tests: '',
        other_tests: '',
        notes: '',
        follow_up_date: '',
        consultation_fee: 0,
        lab_fee: 0,
        xray_fee: 0,
        other_fee: 0
    });

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            const data = await doctorService.getAllDoctors();
            setDoctors(data);
        } catch (err) {
            setError('Failed to fetch doctors');
        }
    };

    const calculateTotal = () => {
        const total = 
            parseFloat(formData.consultation_fee || 0) +
            parseFloat(formData.lab_fee || 0) +
            parseFloat(formData.xray_fee || 0) +
            parseFloat(formData.other_fee || 0);
        return total.toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const prescriptionData = {
                ...formData,
                total_amount: calculateTotal()
            };
            await prescriptionService.createPrescription(prescriptionData);
            onSuccess();
        } catch (err) {
            setError(err.message || 'Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-lg">
                <div className="modal-header">
                    <h3>New Prescription</h3>
                    <button onClick={onCancel}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error">{error}</div>}
                    
                    {!patientId && (
                        <div className="form-group">
                            <label>Patient Name</label>
                            <input
                                type="text"
                                value={formData.patient_name}
                                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                                placeholder="Enter patient name"
                                required
                            />
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Doctor</label>
                        <select
                            value={formData.doctor_id}
                            onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                            required
                        >
                            <option value="">Select Doctor</option>
                            {doctors.map(doctor => (
                                <option key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.first_name} {doctor.last_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Chief Complaint</label>
                        <textarea
                            value={formData.chief_complaint}
                            onChange={(e) => setFormData({ ...formData, chief_complaint: e.target.value })}
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Diagnosis</label>
                        <textarea
                            value={formData.diagnosis}
                            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                            rows="3"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Prescription Details</label>
                        <textarea
                            value={formData.prescription_details}
                            onChange={(e) => setFormData({ ...formData, prescription_details: e.target.value })}
                            rows="5"
                            placeholder="Medicine name, dosage, frequency, duration..."
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Lab Tests</label>
                        <textarea
                            value={formData.lab_tests}
                            onChange={(e) => setFormData({ ...formData, lab_tests: e.target.value })}
                            rows="2"
                            placeholder="Blood test, urine test, etc."
                        />
                    </div>

                    <div className="form-group">
                        <label>X-Ray Tests</label>
                        <textarea
                            value={formData.xray_tests}
                            onChange={(e) => setFormData({ ...formData, xray_tests: e.target.value })}
                            rows="2"
                            placeholder="X-ray, CT scan, MRI, etc."
                        />
                    </div>

                    <div className="form-group">
                        <label>Other Tests</label>
                        <textarea
                            value={formData.other_tests}
                            onChange={(e) => setFormData({ ...formData, other_tests: e.target.value })}
                            rows="2"
                            placeholder="Any other tests or procedures"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Consultation Fee (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.consultation_fee}
                                onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Lab Fee (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.lab_fee}
                                onChange={(e) => setFormData({ ...formData, lab_fee: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>X-Ray Fee (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.xray_fee}
                                onChange={(e) => setFormData({ ...formData, xray_fee: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Other Fee (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.other_fee}
                                onChange={(e) => setFormData({ ...formData, other_fee: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Total Amount: ₹{calculateTotal()}</label>
                    </div>

                    <div className="form-group">
                        <label>Follow-up Date</label>
                        <input
                            type="date"
                            value={formData.follow_up_date}
                            onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows="2"
                            placeholder="Additional notes or instructions"
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={onCancel} disabled={loading}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionForm;
