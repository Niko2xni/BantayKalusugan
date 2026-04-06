import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  Home,
  Users,
  Activity,
  FileCheck,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: <Home size={20} />, label: "Dashboard", id: "dashboard", path: "/admin" },
  { icon: <Users size={20} />, label: "Patients", id: "patients", path: "/admin" },
  { icon: <Activity size={20} />, label: "Vital Records", id: "records", path: "/admin" },
  { icon: <FileCheck size={20} />, label: "Audit Logs", id: "audit", path: "/admin/audit-logs" },
  { icon: <FileText size={20} />, label: "Reports", id: "reports", path: "/admin/reports" },
  { icon: <Settings size={20} />, label: "Settings", id: "settings", path: "/admin/settings" },
];

export default function AdminSidebar({ activeNav, setActiveNav }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleNavClick = (item) => {
    if (item.path === "/admin") {
      if (location.pathname === "/admin") {
        if (setActiveNav) setActiveNav(item.id);
      } else {
        navigate("/admin", { state: { tab: item.id } });
      }
    } else {
      navigate(item.path);
    }
  };

  // Determine active state
  const isItemActive = (item) => {
    if (item.path === "/admin") {
      // If we are on /admin, highlighting depends on the internal activeNav state
      return location.pathname === "/admin" && activeNav === item.id;
    }
    // For other pages, highlighting depends on the URL path
    return location.pathname === item.path;
  };

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo-wrap">
        <img src={logo} alt="BantayKalusugan Logo" />
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`sidebar-nav-btn ${isItemActive(item) ? "active" : ""}`}
            title={item.label}
          >
            {item.icon}
            <span className="nav-tooltip">{item.label}</span>
          </button>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        className="sidebar-logout-btn"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </aside>
  );
}
