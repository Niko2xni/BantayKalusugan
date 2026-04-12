import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

import { getStoredUser } from "../utils/authSession";

function buildDisplayName(name, storedUser) {
  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  if (storedUser) {
    const firstName = typeof storedUser.first_name === "string" ? storedUser.first_name.trim() : "";
    const lastName = typeof storedUser.last_name === "string" ? storedUser.last_name.trim() : "";
    const combined = [firstName, lastName].filter(Boolean).join(" ").trim();
    if (combined) {
      return combined;
    }

    if (typeof storedUser.name === "string" && storedUser.name.trim()) {
      return storedUser.name.trim();
    }
  }

  return "Admin Staff";
}

function buildRoleLabel(role, storedUser) {
  const sourceRole = typeof role === "string" && role.trim()
    ? role.trim()
    : typeof storedUser?.role === "string" && storedUser.role.trim()
      ? storedUser.role.trim()
      : "Administrator";

  if (sourceRole.toLowerCase() === "admin") {
    return "Administrator";
  }

  if (sourceRole.toLowerCase() === "administrator") {
    return "Administrator";
  }

  return sourceRole;
}

function buildInitials(displayName) {
  const parts = displayName.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "AS";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export default function AdminProfileLink({
  name,
  role,
  to = "/admin/settings",
}) {
  const storedUser = getStoredUser();
  const displayName = buildDisplayName(name, storedUser);
  const roleLabel = buildRoleLabel(role, storedUser);
  const initials = buildInitials(displayName);

  return (
    <Link className="topbar-avatar" to={to} aria-label="Admin Profile" title="Admin Profile">
      <div className="topbar-avatar-circle">{initials}</div>
      <div className="topbar-avatar-info">
        <span className="topbar-avatar-name">{displayName}</span>
        <span className="topbar-avatar-role">{roleLabel}</span>
      </div>
      <ChevronDown size={16} style={{ color: "#888", marginLeft: "0.25rem" }} />
    </Link>
  );
}