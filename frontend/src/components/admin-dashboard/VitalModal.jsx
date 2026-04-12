import { useState } from "react";
import { X } from "lucide-react";
import OcrScanner from "./OcrScanner";
import { API_BASE_URL } from "../../utils/adminApi";

const INITIAL_FORM = {
  patientId: "",
  date: new Date().toISOString().split("T")[0],
  time: new Date().toTimeString().slice(0, 5),
  systolic: "",
  diastolic: "",
  heartRate: "",
  temperature: "",
  spO2: "",
  respiratoryRate: "",
  weight: "",
  height: "",
  sourceDocumentUrl: "",
};

function validate(form) {
  const errors = {};
  if (!form.patientId) errors.patientId = "Please select a patient";
  if (!form.date) errors.date = "Date is required";
  if (!form.time) errors.time = "Time is required";
  if (!form.systolic) errors.systolic = "Systolic is required";
  if (!form.diastolic) errors.diastolic = "Diastolic is required";
  if (!form.heartRate) errors.heartRate = "Heart rate is required";
  if (!form.temperature) errors.temperature = "Temperature is required";
  return errors;
}

export default function VitalModal({
  isOpen,
  patients,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const [form, setForm] = useState(() => INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [ocrFilled, setOcrFilled] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async () => {
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    await onSubmit(form);
  };

  const handleOcrResult = (result) => {
    const data = result.extractedData || {};
    setForm((prev) => ({
      ...prev,
      systolic: data.systolic || prev.systolic,
      diastolic: data.diastolic || prev.diastolic,
      heartRate: data.heartRate || prev.heartRate,
      temperature: data.temperature || prev.temperature,
      spO2: data.spO2 || prev.spO2,
      respiratoryRate: data.respiratoryRate || prev.respiratoryRate,
      weight: data.weight || prev.weight,
      height: data.height || prev.height,
      sourceDocumentUrl: result.imageUrl || "",
    }));
    setOcrFilled(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <h3 className="modal-title">Add Vital Signs</h3>
          <button onClick={onClose} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        {/* OCR Scanner */}
        <div className="ocr-section">
          <OcrScanner
            scanEndpoint="/api/admin/ocr/scan-vitals"
            apiBaseUrl={API_BASE_URL}
            buttonLabel="Scan Vitals Document"
            onScanComplete={handleOcrResult}
          />
          {ocrFilled && (
            <p className="ocr-success-msg">
              ✓ Fields auto-filled from scan. Please review before saving.
            </p>
          )}
        </div>

        {submitError && <p className="modal-submit-error">{submitError}</p>}

        <div className="modal-form-grid">
          <div className="modal-form-full">
            <label className="modal-label">Select Patient *</label>
            <select
              value={form.patientId}
              onChange={(event) => handleChange("patientId", event.target.value)}
              className="modal-input"
            >
              <option value="">-- Select a patient --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.id} - {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
            {errors.patientId && <p className="modal-inline-error">{errors.patientId}</p>}
          </div>

          <div>
            <label className="modal-label">Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(event) => handleChange("date", event.target.value)}
              className="modal-input"
            />
            {errors.date && <p className="modal-inline-error">{errors.date}</p>}
          </div>

          <div>
            <label className="modal-label">Time *</label>
            <input
              type="time"
              value={form.time}
              onChange={(event) => handleChange("time", event.target.value)}
              className="modal-input"
            />
            {errors.time && <p className="modal-inline-error">{errors.time}</p>}
          </div>

          <div>
            <label className="modal-label">Systolic (mmHg) *</label>
            <input
              type="number"
              placeholder="e.g., 120"
              value={form.systolic}
              onChange={(event) => handleChange("systolic", event.target.value)}
              className={`modal-input${ocrFilled && form.systolic ? " ocr-highlighted" : ""}`}
            />
            {errors.systolic && <p className="modal-inline-error">{errors.systolic}</p>}
          </div>

          <div>
            <label className="modal-label">Diastolic (mmHg) *</label>
            <input
              type="number"
              placeholder="e.g., 80"
              value={form.diastolic}
              onChange={(event) => handleChange("diastolic", event.target.value)}
              className={`modal-input${ocrFilled && form.diastolic ? " ocr-highlighted" : ""}`}
            />
            {errors.diastolic && <p className="modal-inline-error">{errors.diastolic}</p>}
          </div>

          <div>
            <label className="modal-label">Heart Rate (bpm) *</label>
            <input
              type="number"
              placeholder="e.g., 72"
              value={form.heartRate}
              onChange={(event) => handleChange("heartRate", event.target.value)}
              className={`modal-input${ocrFilled && form.heartRate ? " ocr-highlighted" : ""}`}
            />
            {errors.heartRate && <p className="modal-inline-error">{errors.heartRate}</p>}
          </div>

          <div>
            <label className="modal-label">Temperature (°C) *</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 36.5"
              value={form.temperature}
              onChange={(event) => handleChange("temperature", event.target.value)}
              className={`modal-input${ocrFilled && form.temperature ? " ocr-highlighted" : ""}`}
            />
            {errors.temperature && (
              <p className="modal-inline-error">{errors.temperature}</p>
            )}
          </div>

          <div>
            <label className="modal-label">SpO₂ (%)</label>
            <input
              type="number"
              placeholder="e.g., 98"
              value={form.spO2}
              onChange={(event) => handleChange("spO2", event.target.value)}
              className={`modal-input${ocrFilled && form.spO2 ? " ocr-highlighted" : ""}`}
            />
          </div>

          <div>
            <label className="modal-label">Respiratory Rate</label>
            <input
              type="number"
              placeholder="e.g., 16"
              value={form.respiratoryRate}
              onChange={(event) => handleChange("respiratoryRate", event.target.value)}
              className={`modal-input${ocrFilled && form.respiratoryRate ? " ocr-highlighted" : ""}`}
            />
          </div>

          <div>
            <label className="modal-label">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 65.5"
              value={form.weight}
              onChange={(event) => handleChange("weight", event.target.value)}
              className={`modal-input${ocrFilled && form.weight ? " ocr-highlighted" : ""}`}
            />
          </div>

          <div>
            <label className="modal-label">Height (cm)</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 165"
              value={form.height}
              onChange={(event) => handleChange("height", event.target.value)}
              className={`modal-input${ocrFilled && form.height ? " ocr-highlighted" : ""}`}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel" disabled={isSubmitting} type="button">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-save" disabled={isSubmitting} type="button">
            {isSubmitting ? "Saving..." : "Save Vital Signs"}
          </button>
        </div>
      </div>
    </div>
  );
}
