import { Eye, Edit2, Filter, Plus, Search, Trash2 } from "lucide-react";

import StatusBadge from "./StatusBadge";
import { getStatus } from "./dashboardUtils";

export default function PatientsPanel({
  patients,
  searchQuery,
  onSearchChange,
  getPatientLatestVitals,
  onOpenAddPatient,
  onOpenEditPatient,
  onDeletePatient,
  onViewPatientVitals,
  isLoading,
  error,
  onRetry,
}) {
  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query) ||
      patient.id.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={16} color="#888" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginLeft: "auto" }}>
          <button className="table-action-btn secondary" type="button">
            <Filter size={14} />
            Filter
          </button>
          <button
            onClick={onOpenAddPatient}
            className="table-action-btn"
            type="button"
          >
            <Plus size={14} />
            Add Patient
          </button>
          <button
            onClick={onRetry}
            className="table-action-btn secondary"
            type="button"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: "1.5rem" }}>
        {isLoading ? (
          <div style={{ padding: "1.5rem", color: "#666" }}>Loading patients...</div>
        ) : error ? (
          <div style={{ padding: "1.5rem" }}>
            <p style={{ color: "#C23B21", marginBottom: "0.75rem" }}>{error}</p>
            <button className="table-action-btn secondary" onClick={onRetry}>
              Retry Patients
            </button>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {["Patient ID", "Name", "Age", "Gender", "Last BP", "Status", "Date", "Actions"].map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => {
                    const vitals = getPatientLatestVitals(patient.id);
                    const status = vitals
                      ? getStatus(vitals.systolic, vitals.diastolic)
                      : "No Data";
                    const bpDisplay = vitals
                      ? `${vitals.systolic}/${vitals.diastolic}`
                      : "N/A";

                    return (
                      <tr key={patient.id}>
                        <td style={{ color: "#2E5895", fontWeight: 600 }}>{patient.id}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div
                              className="topbar-avatar-circle"
                              style={{ width: "28px", height: "28px", fontSize: "0.6rem" }}
                            >
                              {patient.firstName.charAt(0)}
                            </div>
                            <span className="patient-name">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </div>
                        </td>
                        <td>{patient.age}</td>
                        <td>{patient.gender}</td>
                        <td style={{ fontWeight: 600, color: "#333" }}>{bpDisplay}</td>
                        <td>
                          <StatusBadge status={status} />
                        </td>
                        <td className="patient-id">{patient.dateRegistered}</td>
                        <td>
                          <div className="row-actions">
                            <button
                              onClick={() => onViewPatientVitals(patient)}
                              className="icon-btn view"
                              title="View vitals"
                              type="button"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => onOpenEditPatient(patient)}
                              className="icon-btn"
                              title="Edit patient"
                              type="button"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => onDeletePatient(patient)}
                              className="icon-btn danger"
                              title="Delete patient"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div
              style={{
                padding: "0.75rem 1.25rem",
                borderTop: "1px solid #f0f0f0",
                fontSize: "0.75rem",
                color: "#888",
              }}
            >
              Showing {filteredPatients.length} of {patients.length} patients
            </div>
          </>
        )}
      </div>
    </div>
  );
}
