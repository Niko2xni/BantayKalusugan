import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import AdminSidebar from "./components/AdminSidebar";
import AdminProfileLink from "./components/AdminProfileLink";
import AdminNotificationsDropdown from "./components/admin-dashboard/AdminNotificationsDropdown";
import { adminFetch, AUTH_REDIRECT_ERROR } from "./utils/adminApi";
import {
  Search,
  Filter,
  Clock,
  Download,
  Eye,
} from "lucide-react";

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
    Report: { bg: "rgba(247,233,118,0.35)", text: "#7a6a10" },
    Settings: { bg: "rgba(46,88,149,0.08)", text: "#2E5895" },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("All");
  const [filterRecordType, setFilterRecordType] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          page_size: String(pageSize),
        });

        if (filterAction !== "All") {
          params.append("action", filterAction);
        }
        if (filterRecordType !== "All") {
          params.append("target_type", filterRecordType);
        }
        if (searchQuery.trim()) {
          params.append("search", searchQuery.trim());
        }

        const response = await adminFetch(`/api/admin/audit-logs?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch audit logs");
        }

        const data = await response.json();
        const mapped = (data.items || []).map((log) => {
          const timestampDate = new Date(log.timestamp);
          return {
            id: `AL-${String(log.id).padStart(3, "0")}`,
            dbId: log.id,
            timestamp: timestampDate.toLocaleString(),
            dateLabel: timestampDate.toLocaleDateString(),
            timeLabel: timestampDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            staffName: log.admin_name || "Admin Staff",
            staffId: `AS-${String(log.admin_id).padStart(3, "0")}`,
            action: log.action,
            patientId:
              log.target_type === "Patient Record"
                ? `P-${String(log.target_id).padStart(3, "0")}`
                : "N/A",
            patientName:
              log.target_type === "Patient Record"
                ? log.target_name || "Unknown Patient"
                : "N/A",
            recordType: log.target_type,
            details: log.details,
            ipAddress: "N/A",
          };
        });

        if (!isCancelled) {
          setAuditLogs(mapped);
          setTotal(data.total || 0);
        }
      } catch (err) {
        if (!isCancelled && err.message !== AUTH_REDIRECT_ERROR) {
          setError(err.message || "Unable to load audit logs.");
          setAuditLogs([]);
          setTotal(0);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [page, pageSize, filterAction, filterRecordType, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleExportLogs = () => {
    const headers = [
      "Timestamp",
      "Staff Name",
      "Staff ID",
      "Action",
      "Patient ID",
      "Patient Name",
      "Record Type",
      "Details",
      "IP Address",
    ];

    const csvContent = [
      headers.join(","),
      ...auditLogs.map((log) =>
        [
          log.timestamp,
          log.staffName,
          log.staffId,
          log.action,
          log.patientId,
          log.patientName,
          log.recordType,
          `"${log.details}"`,
          log.ipAddress || "N/A",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}-page-${page}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activeNav="audit" />

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">Audit Logs</h1>
            <p className="topbar-subtitle">Track all staff actions and vital record modifications</p>
          </div>
          <div className="topbar-right">
            <button
              onClick={handleExportLogs}
              disabled={auditLogs.length === 0}
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
                cursor: auditLogs.length === 0 ? "not-allowed" : "pointer",
                marginRight: "0.5rem",
                opacity: auditLogs.length === 0 ? 0.6 : 1,
              }}
            >
              <Download size={16} />
              Export CSV
            </button>
            <AdminNotificationsDropdown />
            <AdminProfileLink />
          </div>
        </header>

        <main className="admin-body">
          <div
            className="bg-white rounded-xl shadow-sm mb-6"
            style={{ borderRadius: "1rem", backgroundColor: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "1.5rem", overflow: "hidden" }}
          >
            <div className="filter-bar">
              <div className="filter-search">
                <Search size={16} color="#888" />
                <input
                  type="text"
                  placeholder="Search by patient name, staff name, or details..."
                  value={searchQuery}
                  onChange={(e) => {
                    setPage(1);
                    setSearchQuery(e.target.value);
                  }}
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

            {showFilters && (
              <div style={{ padding: "1rem", backgroundColor: "#fafbfc", borderTop: "1px solid #f0f0f0" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.5rem", color: "#555", fontWeight: 600 }}>
                      Action Type
                    </label>
                    <select
                      value={filterAction}
                      onChange={(e) => {
                        setPage(1);
                        setFilterAction(e.target.value);
                      }}
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

                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", marginBottom: "0.5rem", color: "#555", fontWeight: 600 }}>
                      Record Type
                    </label>
                    <select
                      value={filterRecordType}
                      onChange={(e) => {
                        setPage(1);
                        setFilterRecordType(e.target.value);
                      }}
                      className="filter-select"
                      style={{ width: "100%" }}
                    >
                      <option value="All">All Types</option>
                      <option value="Vital Signs">Vital Signs</option>
                      <option value="Patient Record">Patient Record</option>
                      <option value="Appointment">Appointment</option>
                      <option value="Report">Report</option>
                      <option value="Settings">Settings</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="table-card">
            <div className="table-card-header" style={{ padding: "0.75rem 1.5rem", backgroundColor: "#F2F3F5", borderBottom: "1px solid #e0e0e0" }}>
              <p style={{ fontSize: "0.875rem", color: "#555", margin: 0 }}>
                Showing <span style={{ fontWeight: 700, color: "#2E5895" }}>{auditLogs.length}</span> of <span style={{ fontWeight: 700, color: "#2E5895" }}>{total}</span> entries
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
                  {isLoading ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "2rem 1rem", textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "2rem 1rem", textAlign: "center", fontSize: "0.875rem", color: "#C23B21" }}>
                        {error}
                      </td>
                    </tr>
                  ) : auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: "2rem 1rem", textAlign: "center", fontSize: "0.875rem", color: "#888" }}>
                        No audit logs found matching your criteria
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "0.75rem 1rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Clock size={14} color="#888" />
                            <div>
                              <div style={{ fontSize: "0.75rem", color: "#333", fontWeight: 600 }}>
                                {log.timeLabel}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#888" }}>
                                {log.dateLabel}
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

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1rem", borderTop: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: "0.75rem", color: "#666" }}>
                Page {page} of {totalPages}
              </span>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page <= 1 || isLoading}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.4rem",
                    border: "1px solid #dcdcdc",
                    backgroundColor: "white",
                    color: "#333",
                    cursor: page <= 1 || isLoading ? "not-allowed" : "pointer",
                    opacity: page <= 1 || isLoading ? 0.5 : 1,
                  }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || isLoading}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.4rem",
                    border: "1px solid #dcdcdc",
                    backgroundColor: "white",
                    color: "#333",
                    cursor: page >= totalPages || isLoading ? "not-allowed" : "pointer",
                    opacity: page >= totalPages || isLoading ? 0.5 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

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
                x
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
