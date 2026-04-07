import {
  Activity,
  AlertTriangle,
  BarChart,
  CheckCircle,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import StatusBadge from "./StatusBadge";
import { getStatus } from "./dashboardUtils";

function formatDateTime(value) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getAppointmentStatusColors(status) {
  switch (status) {
    case "Confirmed":
      return { bg: "#d1fae5", text: "#065f46" };
    case "Pending":
      return { bg: "#fef3c7", text: "#92400e" };
    case "Completed":
      return { bg: "#e5e7eb", text: "#374151" };
    case "Cancelled":
      return { bg: "#fee2e2", text: "#991b1b" };
    default:
      return { bg: "#f3f4f6", text: "#1f2937" };
  }
}

export default function OverviewPanel({
  statsSummary,
  bpTrendData,
  registrationsData,
  patients,
  appointmentsQueue,
  getPatientLatestVitals,
  onUpdateAppointmentStatus,
  updatingAppointmentId,
  onViewAllPatients,
  isLoading,
  error,
  appointmentsLoading,
  appointmentsError,
  onRetry,
}) {
  if (isLoading) {
    return (
      <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
        Loading dashboard overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
        <p style={{ color: "#C23B21", marginBottom: "0.75rem" }}>{error}</p>
        <button className="table-action-btn secondary" onClick={onRetry}>
          Retry Overview
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Patients",
      value: String(statsSummary.totalPatients),
      icon: <Users size={22} />,
      change: `${statsSummary.totalPatients} registered`,
      color: "#2E5895",
    },
    {
      label: "BP Records Today",
      value: String(statsSummary.bpRecordsToday),
      icon: <Activity size={22} />,
      change: "Today",
      color: "#C23B21",
    },
    {
      label: "High Risk Patients",
      value: String(statsSummary.highRiskCount),
      icon: <AlertTriangle size={22} />,
      change: "Require follow-up",
      color: "#FFC32B",
    },
    {
      label: "Healthy Patients",
      value: String(statsSummary.normalCount),
      icon: <CheckCircle size={22} />,
      change: "Normal status",
      color: "#2E5895",
    },
  ];

  const getPatientLabel = (patientDbId) => {
    const patient = patients.find((item) => item.dbId === patientDbId);
    if (!patient) {
      return {
        name: `Patient #${patientDbId}`,
        id: `P-${String(patientDbId || "").padStart(3, "0")}`,
      };
    }

    return {
      name: `${patient.firstName} ${patient.lastName}`,
      id: patient.id,
    };
  };

  const queuedAppointments = [...appointmentsQueue].sort((a, b) => {
    const statusPriority = { Pending: 0, Confirmed: 1, Completed: 2, Cancelled: 3 };
    const aPriority = statusPriority[a.status] ?? 99;
    const bPriority = statusPriority[b.status] ?? 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });

  return (
    <div>
      <div className="stat-cards-row">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div
              className="stat-card-icon"
              style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div className="stat-card-body">
              <div className="stat-card-value" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="stat-card-label">{stat.label}</div>
              <div className="stat-card-change">{stat.change}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Average BP Trends</h3>
              <p className="chart-card-subtitle">Community-wide blood pressure averages</p>
            </div>
            <BarChart size={18} color="#888" />
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={bpTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} domain={[70, 150]} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#C23B21"
                strokeWidth={2}
                dot={{ fill: "#C23B21", r: 4 }}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#2E5895"
                strokeWidth={2}
                dot={{ fill: "#2E5895", r: 4 }}
                name="Diastolic"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <div>
              <h3 className="chart-card-title">Patient Registrations</h3>
              <p className="chart-card-subtitle">Monthly new patient registrations</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={registrationsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} />
              <YAxis tick={{ fontSize: 11, fill: "#888" }} />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="patients"
                stroke="#2E5895"
                strokeWidth={2}
                dot={{ fill: "#2E5895", r: 4 }}
                name="Patients"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: "1.5rem" }}>
        <div className="table-card-header">
          <h3 className="table-card-title">Recent Patients</h3>
          <button onClick={onViewAllPatients} className="table-action-btn secondary">
            View All
          </button>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Last BP</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {patients.slice(0, 5).map((patient) => {
                const vitals = getPatientLatestVitals(patient.id);
                const status = vitals
                  ? getStatus(vitals.systolic, vitals.diastolic)
                  : "No Data";
                const bpDisplay = vitals
                  ? `${vitals.systolic}/${vitals.diastolic}`
                  : "N/A";

                return (
                  <tr key={patient.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div
                          className="topbar-avatar-circle"
                          style={{ width: "28px", height: "28px", fontSize: "0.6rem" }}
                        >
                          {patient.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="patient-name">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="patient-id">{patient.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: "#333" }}>{bpDisplay}</span>
                    </td>
                    <td>
                      <StatusBadge status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="table-card" style={{ marginTop: "1.5rem" }}>
        <div className="table-card-header">
          <h3 className="table-card-title">Appointment Queue</h3>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Appointment</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsLoading && (
                <tr>
                  <td colSpan={5}>Loading appointment queue...</td>
                </tr>
              )}

              {!appointmentsLoading && appointmentsError && (
                <tr>
                  <td colSpan={5} style={{ color: "#c23b21" }}>
                    {appointmentsError}
                  </td>
                </tr>
              )}

              {!appointmentsLoading && !appointmentsError && queuedAppointments.length === 0 && (
                <tr>
                  <td colSpan={5}>No appointments in queue yet.</td>
                </tr>
              )}

              {!appointmentsLoading && !appointmentsError && queuedAppointments.slice(0, 8).map((appointment) => {
                const patientInfo = getPatientLabel(appointment.patientDbId);
                const statusColors = getAppointmentStatusColors(appointment.status);
                const isUpdating = updatingAppointmentId === appointment.dbId;

                return (
                  <tr key={appointment.id}>
                    <td>
                      <div className="patient-name">{patientInfo.name}</div>
                      <div className="patient-id">{patientInfo.id}</div>
                    </td>
                    <td>
                      <div className="patient-name">{appointment.appointmentType}</div>
                      <div className="patient-id">{appointment.healthArea}</div>
                    </td>
                    <td>{formatDateTime(appointment.scheduledAt)}</td>
                    <td>
                      <span
                        className="badge"
                        style={{ backgroundColor: statusColors.bg, color: statusColors.text }}
                      >
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions" style={{ flexWrap: "wrap" }}>
                        {appointment.status === "Pending" && (
                          <>
                            <button
                              className="table-action-btn"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem" }}
                              onClick={() => onUpdateAppointmentStatus(appointment, "Confirmed")}
                              disabled={isUpdating}
                            >
                              Confirm
                            </button>
                            <button
                              className="table-action-btn secondary"
                              style={{
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.7rem",
                                backgroundColor: "#fee2e2",
                                borderColor: "#fecaca",
                                color: "#991b1b",
                              }}
                              onClick={() => onUpdateAppointmentStatus(appointment, "Cancelled")}
                              disabled={isUpdating}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {appointment.status === "Confirmed" && (
                          <>
                            <button
                              className="table-action-btn"
                              style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem" }}
                              onClick={() => onUpdateAppointmentStatus(appointment, "Completed")}
                              disabled={isUpdating}
                            >
                              Complete
                            </button>
                            <button
                              className="table-action-btn secondary"
                              style={{
                                padding: "0.3rem 0.6rem",
                                fontSize: "0.7rem",
                                backgroundColor: "#fee2e2",
                                borderColor: "#fecaca",
                                color: "#991b1b",
                              }}
                              onClick={() => onUpdateAppointmentStatus(appointment, "Cancelled")}
                              disabled={isUpdating}
                            >
                              Cancel
                            </button>
                          </>
                        )}

                        {(appointment.status === "Completed" || appointment.status === "Cancelled") && (
                          <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
