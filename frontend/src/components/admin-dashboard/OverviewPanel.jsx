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

export default function OverviewPanel({
  statsSummary,
  bpTrendData,
  registrationsData,
  patients,
  getPatientLatestVitals,
  onViewAllPatients,
  isLoading,
  error,
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
    </div>
  );
}
