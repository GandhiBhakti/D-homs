import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import './PMJAYVerification.css';

const PMJAYVerification = ({ onPMJAYLinked, patientData }) => {
  const [step, setStep] = useState('input'); // input, verified, linked
  const [cardNumber, setCardNumber] = useState('');
  const [mobile, setMobile] = useState(patientData?.phone || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pmjayData, setPmjayData] = useState(null);

  const handleVerifyBeneficiary = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE_URL}/abdm/pmjay/verify-beneficiary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardNumber: cardNumber,
          mobile: mobile
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setPmjayData(data.data || data);
        setStep('verified');
      } else {
        setError(data.error || 'Failed to verify beneficiary');
      }
    } catch (err) {
      console.error('PMJAY verification error:', err);
      setError('Failed to connect to PMJAY service');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPMJAY = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      // For now, we'll just mark as linked without checking specific eligibility
      // since we don't have package selection in the UI yet
      const response = await fetch(`${API_BASE_URL}/abdm/pmjay/verify-beneficiary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cardNumber: cardNumber,
          mobile: mobile
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep('linked');
        if (onPMJAYLinked) {
          onPMJAYLinked({
            cardNumber: cardNumber,
            beneficiaryId: cardNumber,
            ...pmjayData
          });
        }
      } else {
        setError(data.error || 'Failed to link PMJAY');
      }
    } catch (err) {
      console.error('PMJAY linking error:', err);
      setError('Failed to link PMJAY');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('input');
    setCardNumber('');
    setError('');
    setPmjayData(null);
  };

  return (
    <div className="pmjay-verification">
      <div className="pmjay-header">
        <h3>🏥 PMJAY (Ayushman Bharat) Verification</h3>
        <p>Verify PMJAY beneficiary for cashless treatment</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {step === 'input' && (
        <form className="pmjay-form" onSubmit={handleVerifyBeneficiary}>
          <div className="form-group">
            <label>PMJAY Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              placeholder="Enter PMJAY card number"
              required
            />
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Enter registered mobile number"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Beneficiary'}
          </button>
        </form>
      )}

      {step === 'verified' && (
        <div className="pmjay-verified">
          <div className="success-icon">✅</div>
          <h4>Beneficiary Verified Successfully!</h4>
          <div className="pmjay-details">
            {pmjayData && (
              <>
                <p><strong>Card Number:</strong> {cardNumber}</p>
                <p><strong>Mobile:</strong> {mobile}</p>
                {pmjayData.name && <p><strong>Name:</strong> {pmjayData.name}</p>}
                {pmjayData.familyId && <p><strong>Family ID:</strong> {pmjayData.familyId}</p>}
                <p><strong>Status:</strong> Verified</p>
              </>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleLinkPMJAY} disabled={loading}>
              {loading ? 'Linking...' : 'Link PMJAY to Patient'}
            </button>
          </div>
        </div>
      )}

      {step === 'linked' && (
        <div className="pmjay-linked">
          <div className="success-icon">✅</div>
          <h4>PMJAY Linked Successfully!</h4>
          <p>Patient is now eligible for cashless treatment under PMJAY scheme.</p>
          <button type="button" className="btn btn-primary" onClick={handleReset}>
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default PMJAYVerification;
