export default function DeleteConfirmModal({
  isOpen,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  isSubmitting,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: "26rem" }}>
        <div className="modal-header">
          <h3 className="modal-title">{title || "Confirm"}</h3>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#555", marginBottom: "1.25rem" }}>
          {description}
        </p>
        <div className="modal-footer" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-save"
            onClick={onConfirm}
            disabled={isSubmitting}
            style={{ backgroundColor: "#C23B21" }}
          >
            {isSubmitting ? "Please wait..." : confirmLabel || "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
