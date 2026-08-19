import React from 'react';

function TopDoctors({ data }) {
  if (!data) return null;

  return (
    <div className="top-doctors">
      <h3>Top Doctors (OPD Today)</h3>
      <div className="doctors-list">
        {data.map((doctor, index) => (
          <div key={index} className="doctor-item">
            <div className="doctor-rank">#{index + 1}</div>
            <div className="doctor-info">
              <div className="doctor-name">{doctor.name}</div>
              <div className="doctor-specialization">{doctor.specialization}</div>
            </div>
            <div className="doctor-patients">
              <span className="patient-count">{doctor.patient_count}</span>
              <span className="patient-label">patients</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TopDoctors;
