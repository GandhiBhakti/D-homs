import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import './ABHAVerification.css';

const ABHAVerification = ({ onABHALinked, patientData }) => {
  const [step, setStep] = useState('input'); // input, otp, success, linked
  const [healthId, setHealthId] = useState('');
  const [authMethod, setAuthMethod] = useState('mobile');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [abhaData, setAbhaData] = useState(null);

  const handleGenerateOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/abdm/generate-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          healthId: healthId,
          authMethod: authMethod
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setTxnId(data.txnId);
        setStep('otp');
      } else {
        setError(data.error || 'Failed to generate OTP');
      }
    } catch (err) {
      setError('Failed to connect to ABDM service');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/abdm/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          txnId: txnId,
          otp: otp
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setAbhaData({
          ...data,
          healthId: healthId
        });
        setStep('success');
      } else {
        setError(data.error || 'Failed to verify OTP');
      }
    } catch (err) {
      setError('Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkABHA = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/abdm/link-abha`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patient_id: patientData.patient_id,
          health_id: abhaData.healthId,
          health_id_number: abhaData.healthIdNumber,
          name: patientData.patient_first_name + ' ' + patientData.patient_last_name,
          gender: patientData.gender,
          year_of_birth: new Date(patientData.date_of_birth).getFullYear(),
          day_of_birth: new Date(patientData.date_of_birth).getDate(),
          month_of_birth: new Date(patientData.date_of_birth).getMonth() + 1,
          state: patientData.state || '',
          district: patientData.district || '',
          mobile: patientData.phone,
          email: patientData.email,
          address: patientData.address,
          access_token: abhaData.accessToken,
          refresh_token: abhaData.refreshToken
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep('linked');
        if (onABHALinked) {
          onABHALinked(data.data);
        }
      } else {
        setError(data.error || 'Failed to link ABHA');
      }
    } catch (err) {
      setError('Failed to link ABHA');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setHealthId('');
    setOtp('');
    setTxnId('');
    setError('');
    setAbhaData(null);
  };

  return (
    <div className="abha-verification">
      <div className="abha-header">
        <h3>🏥 ABHA (Health ID) Verification</h3>
        <p>Link your Ayushman Bharat Health Account for digital health records</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {step === 'input' && (
        <form className="abha-form" onSubmit={handleGenerateOTP}>
          <div className="form-group">
            <label>ABHA Number / Mobile Number</label>
            <input
              type="text"
              value={healthId}
              onChange={(e) => setHealthId(e.target.value)}
              placeholder="Enter 14-digit ABHA number or mobile number"
              required
            />
          </div>

          <div className="form-group">
            <label>Authentication Method</label>
            <select
              value={authMethod}
              onChange={(e) => setAuthMethod(e.target.value)}
            >
              <option value="mobile">Mobile OTP</option>
              <option value="aadhaar">Aadhaar OTP</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating OTP...' : 'Generate OTP'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form className="abha-form" onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter the OTP sent to your mobile"
              maxLength="6"
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div className="abha-success">
          <div className="success-icon">✅</div>
          <h4>ABHA Verified Successfully!</h4>
          <div className="abha-details">
            <p><strong>Health ID:</strong> {abhaData.healthId}</p>
            {abhaData.healthIdNumber && (
              <p><strong>ABHA Number:</strong> {abhaData.healthIdNumber}</p>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleLinkABHA} disabled={loading}>
              {loading ? 'Linking...' : 'Link ABHA to Patient'}
            </button>
          </div>
        </div>
      )}

      {step === 'linked' && (
        <div className="abha-linked">
          <div className="success-icon">✅</div>
          <h4>ABHA Linked Successfully!</h4>
          <p>Your ABHA has been linked to this patient record.</p>
          <button type="button" className="btn btn-primary" onClick={handleReset}>
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default ABHAVerification;
