import { useState } from "react";
import { X } from "lucide-react";
import OcrScanner from "./OcrScanner";
import { API_BASE_URL } from "../../utils/adminApi";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  date_of_birth: "",
  gender: "Male",
  phone: "",
  address: "",
  email: "",
  sourceDocumentUrl: "",
};

function validate(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  if (!form.date_of_birth) errors.date_of_birth = "Date of birth is required";
  if (!form.phone.trim()) errors.phone = "Phone is required";
  return errors;
}

export default function PatientModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const [form, setForm] = useState(() => {
    if (mode === "edit" && initialData) {
      return {
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        date_of_birth: initialData.date_of_birth || "",
        gender: initialData.gender || "Male",
        phone: initialData.phone || "",
        address: initialData.address || "",
        email: initialData.email || "",
        sourceDocumentUrl: "",
      };
    }
    return INITIAL_FORM;
  });
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
      firstName: data.firstName || prev.firstName,
      lastName: data.lastName || prev.lastName,
      date_of_birth: data.date_of_birth || prev.date_of_birth,
      gender: data.gender || prev.gender,
      phone: data.phone || prev.phone,
      address: data.address || prev.address,
      email: data.email || prev.email,
      sourceDocumentUrl: result.imageUrl || "",
    }));
    setOcrFilled(true);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">
            {mode === "edit" ? "Edit Patient" : "Add New Patient"}
          </h3>
          <button onClick={onClose} className="modal-close-btn" type="button">
            <X size={20} />
          </button>
        </div>

        {/* OCR Scanner — only show for "add" mode */}
        {mode !== "edit" && (
          <div className="ocr-section">
            <OcrScanner
              scanEndpoint="/api/admin/ocr/scan-patient"
              apiBaseUrl={API_BASE_URL}
              buttonLabel="Scan Patient ID / Record"
              onScanComplete={handleOcrResult}
            />
            {ocrFilled && (
              <p className="ocr-success-msg">
                ✓ Fields auto-filled from scan. Please review before saving.
              </p>
            )}
          </div>
        )}

        {submitError && <p className="modal-submit-error">{submitError}</p>}

        <div className="modal-form-grid">
          <div>
            <label className="modal-label">First Name *</label>
            <input
              type="text"
              placeholder="First name"
              value={form.firstName}
              onChange={(event) => handleChange("firstName", event.target.value)}
              className={`modal-input${ocrFilled && form.firstName ? " ocr-highlighted" : ""}`}
            />
            {errors.firstName && <p className="modal-inline-error">{errors.firstName}</p>}
          </div>
          <div>
            <label className="modal-label">Last Name *</label>
            <input
              type="text"
              placeholder="Last name"
              value={form.lastName}
              onChange={(event) => handleChange("lastName", event.target.value)}
              className={`modal-input${ocrFilled && form.lastName ? " ocr-highlighted" : ""}`}
            />
            {errors.lastName && <p className="modal-inline-error">{errors.lastName}</p>}
          </div>

          <div>
            <label className="modal-label">Date of Birth *</label>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(event) => handleChange("date_of_birth", event.target.value)}
              className={`modal-input${ocrFilled && form.date_of_birth ? " ocr-highlighted" : ""}`}
            />
            {errors.date_of_birth && (
              <p className="modal-inline-error">{errors.date_of_birth}</p>
            )}
          </div>
          <div>
            <label className="modal-label">Gender *</label>
            <select
              value={form.gender}
              onChange={(event) => handleChange("gender", event.target.value)}
              className={`modal-input${ocrFilled && form.gender ? " ocr-highlighted" : ""}`}
            >
              <option>Male</option>
              <option>Female</option>
            </select>
          </div>

          <div className="modal-form-full">
            <label className="modal-label">Phone *</label>
            <input
              type="text"
              placeholder="Phone number"
              value={form.phone}
              onChange={(event) => handleChange("phone", event.target.value)}
              className={`modal-input${ocrFilled && form.phone ? " ocr-highlighted" : ""}`}
            />
            {errors.phone && <p className="modal-inline-error">{errors.phone}</p>}
          </div>

          <div className="modal-form-full">
            <label className="modal-label">Address</label>
            <input
              type="text"
              placeholder="Barangay address"
              value={form.address}
              onChange={(event) => handleChange("address", event.target.value)}
              className={`modal-input${ocrFilled && form.address ? " ocr-highlighted" : ""}`}
            />
          </div>

          <div className="modal-form-full">
            <label className="modal-label">Email</label>
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(event) => handleChange("email", event.target.value)}
              className={`modal-input${ocrFilled && form.email ? " ocr-highlighted" : ""}`}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-cancel" disabled={isSubmitting} type="button">
            Cancel
          </button>
          <button onClick={handleSubmit} className="btn-save" disabled={isSubmitting} type="button">
            {isSubmitting
              ? "Saving..."
              : mode === "edit"
                ? "Save Changes"
                : "Add Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}
