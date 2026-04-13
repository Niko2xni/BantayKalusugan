import { useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";

function getDefaultMessage(patient) {
  if (patient) {
    return `Hi ${patient.firstName}, this is a reminder from BantayKalusugan for your upcoming checkup. Please reply or visit the clinic if you have questions.`;
  }
  return "This is a test notification from BantayKalusugan.";
}

export default function NotifyPatientModal({
  isOpen,
  patient,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  const [message, setMessage] = useState(() => getDefaultMessage(patient));
  const [phone, setPhone] = useState(() => patient?.phone || "");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !phone.trim()) return;
    
    // We pass back the message, the phone (in case they edited it for testing), and patient ID if available
    onSubmit({
      message: message.trim(),
      phone_number: phone.trim(),
      patient_id: patient ? patient.dbId : null
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "500px" }}>
        <div className="modal-header">
          <h2 className="modal-title">
            <MessageSquare size={18} />
            {patient ? `Notify ${patient.firstName} ${patient.lastName}` : "Send SMS Notification"}
          </h2>
          <button className="modal-close-btn" onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {submitError && (
            <div className="modal-error">
              {submitError}
            </div>
          )}

          <div className="form-group row">
            <div className="form-field full-width">
              <label>Recipient Phone Number *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                placeholder="09123456789"
                disabled={isSubmitting}
              />
              <span style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px", display: "inline-block" }}>
                Format should be 09XXXXXXXXX or +639XXXXXXXXX
              </span>
            </div>
          </div>

          <div className="form-group row">
            <div className="form-field full-width">
              <label>Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Type your notification message here..."
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  resize: "vertical",
                  fontFamily: "inherit",
                  fontSize: "0.9rem"
                }}
              />
              <span style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px", display: "inline-block" }}>
                Characters: {message.length}. Standard SMS limit is 160.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={isSubmitting || !message.trim() || !phone.trim()}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="ocr-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send SMS
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
