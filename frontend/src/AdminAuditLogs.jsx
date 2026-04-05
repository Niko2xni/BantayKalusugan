import { useState } from "react";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import logo from "./assets/logo.png";
import {
  Home,
  Users,
  Activity,
  FileText,
  Settings,
  LogOut,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  FileCheck,
  Edit,
  Trash2,
  Plus,
  Download,
  Eye,
  Bell,
  ChevronDown,
} from "lucide-react";

// Mock audit logs data
const initialAuditLogs = [
  {
    id: "AL-001",
    timestamp: "2026-03-19 14:23:15",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Added",
    patientId: "P-001",
    patientName: "Maria Santos",
    recordType: "Vital Signs",
    details: "Blood Pressure: 130/85, Heart Rate: 78, Temp: 36.6°C, SpO₂: 97%, Weight: 65kg, Height: 158cm",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-002",
    timestamp: "2026-03-19 13:45:22",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Updated",
    patientId: "P-002",
    patientName: "Juan dela Cruz",
    recordType: "Patient Record",
    details: "Patient assigned to Barangay Zone 2 Health Clinic",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-003",
    timestamp: "2026-03-19 11:30:08",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Added",
    patientId: "P-003",
    patientName: "Rosario Reyes",
    recordType: "Vital Signs",
    details: "Blood Pressure: 145/92, Heart Rate: 88, Temp: 36.7°C, SpO₂: 95%, Weight: 58kg, Height: 155cm",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-004",
    timestamp: "2026-03-18 16:12:45",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Transferred",
    patientId: "P-004",
    patientName: "Eduardo Lim",
    recordType: "Patient Record",
    details: "Patient transferred to Zone 3 health center",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-005",
    timestamp: "2026-03-18 14:55:30",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Added",
    patientId: "P-005",
    patientName: "Lourdes Garcia",
    recordType: "Vital Signs",
    details: "Blood Pressure: 138/88, Heart Rate: 80, Temp: 36.6°C, SpO₂: 96%, Weight: 60kg, Height: 160cm",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-006",
    timestamp: "2026-03-18 10:20:17",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Added",
    patientId: "P-002",
    patientName: "Juan dela Cruz",
    recordType: "Vital Signs",
    details: "Blood Pressure: 118/76, Heart Rate: 74, Temp: 36.4°C, SpO₂: 98%, Weight: 72kg, Height: 170cm",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-007",
    timestamp: "2026-03-17 15:40:55",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Deleted",
    patientId: "P-006",
    patientName: "Carlos Hernandez",
    recordType: "Patient Record",
    details: "Patient record deleted (duplicate entry)",
    ipAddress: "192.168.1.105",
  },
  {
    id: "AL-008",
    timestamp: "2026-03-17 09:15:42",
    staffName: "Admin Staff",
    staffId: "AS-001",
    action: "Added",
    patientId: "P-001",
    patientName: "Maria Santos",
    recordType: "Appointment",
    details: "Scheduled follow-up appointment for 2026-03-25",
    ipAddress: "192.168.1.105",
  },
];

const navItems = [
  { icon: <Home size={20} />, label: "Dashboard", id: "dashboard", path: "/admin" },
  { icon: <Users size={20} />, label: "Patients", id: "patients", path: "/admin" },
  { icon: <Activity size={20} />, label: "Vital Records", id: "records", path: "/admin" },
  { icon: <FileCheck size={20} />, label: "Audit Logs", id: "audit", path: "/admin/audit-logs" },
  { icon: <FileText size={20} />, label: "Reports", id: "reports", path: "/admin/reports" },
  { icon: <Settings size={20} />, label: "Settings", id: "settings", path: "/admin/settings" },
];

function ActionBadge({ action }) {
  const styles = {
    Added: { bg: "rgba(46,88,149,0.1)", text: "#2E5895" },
    Updated: { bg: "rgba(255,195,43,0.15)", text: "#b8820a" },
    Deleted: { bg: "rgba(194,59,33,0.1)", text: "#C23B21" },
    Transferred: { bg: "rgba(242,243,245,0.5)", text: "#333333" },
  };
  const style = styles[action] || styles.Added;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs"
      style={{ backgroundColor: style.bg, color: style.text, fontWeight: 600, display: "inline-block" }}
    >
      {action}
    </span>
  );
}

function RecordTypeBadge({ type }) {
  const styles = {
    "Vital Signs": { bg: "rgba(46,88,149,0.1)", text: "#2E5895" },
    "Patient Record": { bg: "rgba(255,195,43,0.15)", text: "#b8820a" },
    Appointment: { bg: "rgba(194,59,33,0.1)", text: "#C23B21" },
  };
  const style = styles[type] || styles["Vital Signs"];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs"
      style={{ backgroundColor: style.bg, color: style.text, fontWeight: 600, display: "inline-block" }}
    >
      {type}
    </span>
  );
}

export default function AdminAuditLogs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("All");
  const [filterRecordType, setFilterRecordType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const handleLogout = () => {
    navigate("/login");
  };

  const handleNavClick = (path) => {
    navigate(path);
  };

  // Filter audit logs
  const filteredLogs = initialAuditLogs.filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.staffName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = filterAction === "All" || log.action === filterAction;
    const matchesRecordType = filterRecordType === "All" || log.recordType === filterRecordType;

    return matchesSearch && matchesAction && matchesRecordType;
  });

  // Export audit logs as CSV
  const handleExportLogs = () => {
    const headers = ["Timestamp", "Staff Name", "Staff ID", "Action", "Patient ID", "Patient Name", "Record Type", "Details", "IP Address"];
    const csvContent = [
      headers.join(","),
      ...filteredLogs.map(log => 
        [
          log.timestamp,
          log.staffName,
          log.staffId,
          log.action,
          log.patientId,
          log.patientName,
          log.recordType,
          `"${log.details}"`,
          log.ipAddress || "N/A"
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-logo-wrap">
          <img src={logo} alt="BantayKalusugan Logo" />
        </div>

        {/* Nav Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`sidebar-nav-btn ${item.id === "audit" ? "active" : ""}`}
              title={item.label}
            >
              {item.icon}
              <span className="nav-tooltip">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="sidebar-logout-btn"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Header */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Audit Logs</h1>
            <p className="topbar-subtitle">Track all staff actions and vital record modifications</p>
          </div>
          <div className="topbar-right">
            <button
              onClick={handleExportLogs}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.875rem",
                backgroundColor: "#2E5895",
                color: "white",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                marginRight: "0.5rem"
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
            <button className="topbar-bell-btn">
              <Bell size={20} />
              <span className="bell-dot" />
            </button>
            <div className="topbar-avatar">
              <div className="topbar-avatar-circle">
                AS
              </div>
              <div className="topbar-avatar-info">
                <span className="topbar-avatar-name">Admin Staff</span>
                <span style={{ fontSize: "0.75rem", color: "#888" }}>Administrator</span>
              </div>
              <ChevronDown size={16} style={{ color: "#888", marginLeft: "0.25rem" }} />
            </div>
          </div>
        </header>

        {/* Search & Filters */}
        <main className="admin-body">
            <div className="bg-white rounded-xl shadow-sm mb-6" style={{ borderRadius: "1rem", backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem", overflow: "hidden" }}>
                <div className="filter-bar">
                    <div className="filter-search">
                        <Search size={16} color="#888" />
                        <input
                            type="text"
                            placeholder="Search by patient name, staff name, or details..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={showFilters ? "table-action-btn" : "table-action-btn secondary"}
                        >
                            <Filter size={14} />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div style={{ padding: "1rem", backgroundColor: "#fafbfc", borderTop: "1px solid #f0f0f0" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                            {/* Action Filter */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.5rem", color: "#555", fontWeight: 600 }}>
                                    Action Type
                                </label>
                                <select
                                    value={filterAction}
                                    onChange={(e) => setFilterAction(e.target.value)}
                                    className="filter-select"
                                    style={{ width: "100%" }}
                                >
                                    <option value="All">All Actions</option>
                                    <option value="Added">Added</option>
                                    <option value="Updated">Updated</option>
                                    <option value="Deleted">Deleted</option>
                                    <option value="Transferred">Transferred</option>
                                </select>
                            </div>

                            {/* Record Type Filter */}
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.5rem", color: "#555", fontWeight: 600 }}>
                                    Record Type
                                </label>
                                <select
                                    value={filterRecordType}
                                    onChange={(e) => setFilterRecordType(e.target.value)}
                                    className="filter-select"
                                    style={{ width: "100%" }}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Vital Signs">Vital Signs</option>
                                    <option value="Patient Record">Patient Record</option>
                                    <option value="Appointment">Appointment</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Audit Logs Table */}
            <div className="table-card">
              <div className="table-card-header" style={{ padding: "0.75rem 1.5rem", backgroundColor: "#F2F3F5", borderBottom: "1px solid #e0e0e0" }}>
                <p style={{ fontSize: "0.875rem", color: "#555", margin: 0 }}>
                  Showing <span style={{ fontWeight: 700, color: "#2E5895" }}>{filteredLogs.length}</span> audit log entries
                </p>
              </div>

              <div className="table-wrapper">
                <table className="data-table" style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#F2F3F5", borderBottom: "1px solid #e0e0e0" }}>
                    <tr>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Timestamp</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Staff</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Action</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Patient</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Record Type</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Details</th>
                      <th style={{ padding: "0.75rem 1rem", fontSize: "0.75rem", color: "#555", fontWeight: 700 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: "2rem 1rem", textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
                          No audit logs found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <Clock size={14} color="#888" />
                              <div>
                                <div style={{ fontSize: "0.75rem", color: "#333", fontWeight: 600 }}>
                                  {log.timestamp.split(" ")[1]}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#888" }}>
                                  {log.timestamp.split(" ")[0]}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "#333", fontWeight: 600 }}>{log.staffName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>{log.staffId}</div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <ActionBadge action={log.action} />
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "#333", fontWeight: 600 }}>{log.patientName}</div>
                            <div style={{ fontSize: "0.75rem", color: "#888" }}>{log.patientId}</div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <RecordTypeBadge type={log.recordType} />
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ fontSize: "0.75rem", color: "#555", maxWidth: "250px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {log.details}
                            </div>
                          </td>
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <button
                              onClick={() => setSelectedLog(log)}
                              style={{ padding: "0.5rem", borderRadius: "0.25rem", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              title="View Details"
                            >
                              <Eye size={16} color="#2E5895" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </main>
      </div>

      {/* View Log Details Modal */}
      {selectedLog && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedLog(null)}
        >
          <div
            style={{ backgroundColor: "white", borderRadius: "1rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "1.5rem", maxWidth: "600px", width: "100%", margin: "0 1rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#2E5895", margin: 0 }}>
                Audit Log Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Log ID</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.id}</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Timestamp</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.timestamp}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Staff Name</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.staffName}</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Staff ID</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.staffId}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Action</label>
                  <div><ActionBadge action={selectedLog.action} /></div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Record Type</label>
                  <div><RecordTypeBadge type={selectedLog.recordType} /></div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Patient Name</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.patientName}</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Patient ID</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.patientId}</div>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>Details</label>
                <div style={{ fontSize: "0.875rem", padding: "0.75rem", borderRadius: "0.5rem", color: "#333", backgroundColor: "#F2F3F5" }}>
                  {selectedLog.details}
                </div>
              </div>

              {selectedLog.ipAddress && (
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.25rem", color: "#888", fontWeight: 600 }}>IP Address</label>
                  <div style={{ fontSize: "0.875rem", color: "#333", fontWeight: 600 }}>{selectedLog.ipAddress}</div>
                </div>
              )}
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setSelectedLog(null)}
                style={{ padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", backgroundColor: "#2E5895", color: "white", fontWeight: 600, border: "none", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
