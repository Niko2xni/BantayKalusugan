import { X } from "lucide-react";
import StatusBadge from "./StatusBadge";
import { getStatus, calculateBMI } from "./dashboardUtils";
import { getSecureDocumentUrl } from "../../utils/adminApi";

export default function VitalDetailsModal({ vital, onClose }) {
  if (!vital) return null;

  const bloodPressure = `${vital.systolic || "--"}/${vital.diastolic || "--"}`;
  const overallStatus = getStatus(vital.systolic, vital.diastolic);
  const bmi = calculateBMI(vital.weight, vital.height);

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "780px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Vital Signs Details</h3>
          <button onClick={onClose} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="vital-modal-grid">
          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Patient Information</h4>
            <div className="vital-modal-list">
              <p><strong>ID:</strong> {vital.patientId || "N/A"}</p>
              <p>
                <strong>Name:</strong> {vital.patientName || "Unknown"}
              </p>
              <p><strong>Record Date:</strong> {vital.date || "N/A"}</p>
              <p><strong>Record Time:</strong> {vital.time || "N/A"}</p>
            </div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Blood Pressure</h4>
            <div className="vital-modal-value">{bloodPressure}</div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Heart Rate</h4>
            <div className="vital-modal-value">{vital.heartRate || "--"} bpm</div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Temperature</h4>
            <div className="vital-modal-value">{vital.temperature || "--"} °C</div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Oxygen Saturation</h4>
            <div className="vital-modal-value">{vital.spO2 || "--"}%</div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Respiratory Rate</h4>
            <div className="vital-modal-value">{vital.respiratoryRate || "--"} breaths/min</div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Anthropometric Data</h4>
            <div className="vital-modal-list">
              <p><strong>Weight:</strong> {vital.weight || "--"} kg</p>
              <p><strong>Height:</strong> {vital.height || "--"} cm</p>
              <p><strong>BMI:</strong> {bmi}</p>
            </div>
          </div>

          <div className="vital-modal-card">
            <h4 className="vital-modal-card-title">Overall Blood Pressure Status</h4>
            <StatusBadge status={overallStatus} />
          </div>

          {vital.sourceDocumentUrl && (
            <div className="vital-modal-card" style={{ gridColumn: "1 / -1" }}>
              <h4 className="vital-modal-card-title">Source Document</h4>
              <a
                href={getSecureDocumentUrl(vital.sourceDocumentUrl)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "0.875rem", color: "#2E5895", fontWeight: 600, textDecoration: "underline" }}
              >
                View Scanned Document
              </a>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel" type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
