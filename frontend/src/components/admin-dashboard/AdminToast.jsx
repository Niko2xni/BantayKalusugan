import { AlertTriangle, CheckCircle, Info } from "lucide-react";

const TOAST_STYLES = {
  success: {
    bg: "#2E5895",
    icon: CheckCircle,
  },
  error: {
    bg: "#C23B21",
    icon: AlertTriangle,
  },
  info: {
    bg: "#334155",
    icon: Info,
  },
};

export default function AdminToast({ toast, onClose }) {
  if (!toast) return null;

  const variant = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = variant.icon;

  return (
    <div className="admin-toast-wrap">
      <div className="admin-toast" style={{ backgroundColor: variant.bg }}>
        <Icon size={18} color="white" />
        <span>{toast.message}</span>
        <button type="button" onClick={onClose} className="admin-toast-close">
          x
        </button>
      </div>
    </div>
  );
}
