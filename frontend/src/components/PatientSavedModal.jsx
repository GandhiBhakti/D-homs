import React from "react";

function PatientSavedModal({
  isOpen,
  title,
  subtitle,
  patientName,
  details,
  onClose,
  onViewList,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <div className="modal-badge">Saved successfully</div>
            <h3>{title}</h3>
            <p>{subtitle}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modal-highlight">{patientName}</div>
          <div className="modal-detail-list">
            {details.map((item) => (
              <div key={item.label} className="modal-detail-row">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onViewList}
          >
            Open list
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientSavedModal;
