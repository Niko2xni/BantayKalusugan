import { Eye, Plus, Trash2 } from "lucide-react";
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

export default function VitalsPanel({
  vitalSigns,
  vitalSubmissions,
  bpTrendData,
  getVitalPatientName,
  onReviewSubmission,
  onOpenAddVital,
  onDeleteVital,
  onViewVital,
  isLoading,
  error,
  submissionsLoading,
  submissionsError,
  reviewingSubmissionId,
  isStatsLoading,
  statsError,
  onRetryVitals,
  onRetrySubmissions,
  onRetryStats,
}) {
  const sortedVitals = [...vitalSigns].sort(
    (a, b) =>
      new Date(`${b.date} ${b.time}`).getTime() -
      new Date(`${a.date} ${a.time}`).getTime()
  );

  const sortedSubmissions = [...(vitalSubmissions || [])].sort(
    (a, b) =>
      new Date(`${b.date} ${b.time}`).getTime() -
      new Date(`${a.date} ${a.time}`).getTime()
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#333" }}>
          Vital Sign Records
        </h2>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={onRetryVitals}
            className="table-action-btn secondary"
            type="button"
          >
            Refresh
          </button>
          <button onClick={onOpenAddVital} className="table-action-btn" type="button">
            <Plus size={14} />
            Add Vital Signs
          </button>
        </div>
      </div>

      <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
        <div className="chart-card-header">
          <div>
            <h3 className="chart-card-title">Community BP Trend</h3>
            <p className="chart-card-subtitle">
              Average blood pressure readings across all patients
            </p>
          </div>
        </div>

        {isStatsLoading ? (
          <div style={{ padding: "1rem", color: "#666" }}>Loading trend chart...</div>
        ) : statsError ? (
          <div style={{ padding: "1rem" }}>
            <p style={{ color: "#C23B21", marginBottom: "0.75rem" }}>{statsError}</p>
            <button className="table-action-btn secondary" onClick={onRetryStats}>
              Retry Trend Data
            </button>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={bpTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#888" }} />
              <YAxis tick={{ fontSize: 12, fill: "#888" }} domain={[70, 160]} />
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
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#C23B21" }}
                name="Avg Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#2E5895"
                strokeWidth={2.5}
                dot={{ r: 5, fill: "#2E5895" }}
                name="Avg Diastolic"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="table-card" style={{ marginBottom: "1.5rem" }}>
        <div className="table-card-header">
          <h3 className="table-card-title">Pending Patient Vital Submissions</h3>
          <button
            onClick={onRetrySubmissions}
            className="table-action-btn secondary"
            type="button"
          >
            Refresh Queue
          </button>
        </div>

        {submissionsLoading ? (
          <div style={{ padding: "1.5rem", color: "#666" }}>Loading submissions...</div>
        ) : submissionsError ? (
          <div style={{ padding: "1.5rem" }}>
            <p style={{ color: "#C23B21", marginBottom: "0.75rem" }}>{submissionsError}</p>
            <button className="table-action-btn secondary" onClick={onRetrySubmissions}>
              Retry Submission Queue
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Submitted</th>
                  <th>Patient</th>
                  <th>BP</th>
                  <th>HR</th>
                  <th>Temp</th>
                  <th>SpO₂</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.length === 0 && (
                  <tr>
                    <td colSpan={7}>No pending patient submissions.</td>
                  </tr>
                )}

                {sortedSubmissions.map((submission) => {
                  const isReviewing = reviewingSubmissionId === submission.dbId;

                  return (
                    <tr key={submission.id}>
                      <td>
                        <div className="patient-name">{submission.date}</div>
                        <div className="patient-id">{submission.time}</div>
                      </td>
                      <td>
                        <div className="patient-name">{submission.patientName}</div>
                        <div className="patient-id">{submission.patientId}</div>
                      </td>
                      <td style={{ color: "#C23B21", fontWeight: 600 }}>
                        {submission.systolic}/{submission.diastolic}
                      </td>
                      <td>{submission.heartRate} bpm</td>
                      <td>{submission.temperature}°C</td>
                      <td>{submission.spO2}%</td>
                      <td>
                        <div className="row-actions" style={{ flexWrap: "wrap" }}>
                          <button
                            className="table-action-btn"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.7rem" }}
                            onClick={() => onReviewSubmission(submission, "approved")}
                            disabled={isReviewing}
                            type="button"
                          >
                            {isReviewing ? "Working..." : "Approve"}
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
                            onClick={() => onReviewSubmission(submission, "rejected")}
                            disabled={isReviewing}
                            type="button"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="table-card">
        {isLoading ? (
          <div style={{ padding: "1.5rem", color: "#666" }}>Loading vital records...</div>
        ) : error ? (
          <div style={{ padding: "1.5rem" }}>
            <p style={{ color: "#C23B21", marginBottom: "0.75rem" }}>{error}</p>
            <button className="table-action-btn secondary" onClick={onRetryVitals}>
              Retry Vital Records
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  {["Date", "Time", "Patient", "BP", "HR", "Temp", "SpO₂", "Status", "Actions"].map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedVitals.map((vital) => {
                  const status = getStatus(vital.systolic, vital.diastolic);
                  return (
                    <tr key={vital.id}>
                      <td>{vital.date}</td>
                      <td className="patient-id">{vital.time}</td>
                      <td className="patient-name">{getVitalPatientName(vital)}</td>
                      <td style={{ color: "#C23B21", fontWeight: 600 }}>
                        {vital.systolic}/{vital.diastolic}
                      </td>
                      <td>{vital.heartRate} bpm</td>
                      <td>{vital.temperature}°C</td>
                      <td>{vital.spO2}%</td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                      <td>
                        <div className="row-actions">
                          <button
                            onClick={() => onViewVital(vital)}
                            className="icon-btn view"
                            title="View details"
                            type="button"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteVital(vital)}
                            className="icon-btn danger"
                            title="Delete record"
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
        )}
      </div>
    </div>
  );
}
