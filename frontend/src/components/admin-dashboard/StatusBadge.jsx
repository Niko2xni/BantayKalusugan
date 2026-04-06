import { getStatusStyle } from "./dashboardUtils";

export default function StatusBadge({ status }) {
  const style = getStatusStyle(status);
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs"
      style={{ backgroundColor: style.bg, color: style.text, fontWeight: 600 }}
    >
      {status}
    </span>
  );
}
