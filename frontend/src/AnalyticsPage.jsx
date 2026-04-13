import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';

import Layout from './Layout.jsx';
import usePatientVitalsData from './hooks/usePatientVitalsData';
import styles from './user_dashboard.module.css';
import { createVitalSubmission, fetchVitalSubmissions } from './utils/patientPortalApi';
import {
  calculateVitalAverages,
  getStatusColors,
  getVitalStatus,
  mapApiVitalToTableRow,
} from './utils/patientVitals';

function VitalValueTag({ type, value, suffix = '' }) {
  const status = getVitalStatus(type, value);
  const { bgColor, color } = getStatusColors(status);

  return (
    <span
      style={{
        backgroundColor: bgColor,
        color,
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'inline-block',
      }}
    >
      {value}
      {suffix}
    </span>
  );
}

const INITIAL_SUBMISSION_FORM = {
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  systolic: '',
  diastolic: '',
  heartRate: '',
  temperature: '',
  spO2: '98',
  respiratoryRate: '16',
  weight: '',
  height: '',
  sourceDocumentUrl: '',
};

function getSubmissionStatusStyle(status) {
  const normalized = String(status || 'pending').toLowerCase();
  if (normalized === 'approved') {
    return { bg: '#dcfce7', text: '#166534', label: 'Approved' };
  }
  if (normalized === 'rejected') {
    return { bg: '#fee2e2', text: '#991b1b', label: 'Rejected' };
  }
  return { bg: '#fef3c7', text: '#92400e', label: 'Pending' };
}

const AnalyticsPage = () => {
  const [exportError, setExportError] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
  const [submissionForm, setSubmissionForm] = useState(INITIAL_SUBMISSION_FORM);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState('');
  const {
    vitals,
    overview,
    loading,
    error,
    filters,
    setFilters,
    reloadVitalsData,
    exportVitalsFile,
  } = usePatientVitalsData();

  useEffect(() => {
    let isMounted = true;

    const loadSubmissions = async () => {
      setSubmissionsLoading(true);
      setSubmissionsError('');

      try {
        const rows = await fetchVitalSubmissions();
        if (!isMounted) return;

        const normalizedRows = Array.isArray(rows)
          ? [...rows].sort((a, b) => {
              const aTime = new Date(`${a.date || ''} ${a.time || ''}`).getTime();
              const bTime = new Date(`${b.date || ''} ${b.time || ''}`).getTime();
              return bTime - aTime;
            })
          : [];

        setSubmissions(normalizedRows);
      } catch (loadIssue) {
        if (!isMounted) return;
        setSubmissionsError(
          loadIssue instanceof Error
            ? loadIssue.message
            : 'Unable to load submission history.'
        );
      } finally {
        if (isMounted) {
          setSubmissionsLoading(false);
        }
      }
    };

    loadSubmissions();

    return () => {
      isMounted = false;
    };
  }, []);

  const tableRows = useMemo(() => vitals.map(mapApiVitalToTableRow), [vitals]);
  const averages = useMemo(() => calculateVitalAverages(vitals), [vitals]);

  const summary = {
    avgSystolic: overview ? Math.round(overview.avg_systolic) : averages.avgSystolic,
    avgDiastolic: overview ? Math.round(overview.avg_diastolic) : averages.avgDiastolic,
    avgHeartRate: overview ? Math.round(overview.avg_heart_rate) : averages.avgHeartRate,
    avgTemp: overview ? Number(overview.avg_temperature.toFixed(1)) : averages.avgTemp,
    avgSpO2: overview ? Number(overview.avg_spo2.toFixed(1)) : averages.avgSpO2,
    avgBMI: averages.avgBMI,
  };

  const submissionInputStyle = {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '0.9rem',
    color: '#1f2937',
    background: '#ffffff',
  };

  const handleDateFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleExport = async () => {
    setExportError('');
    try {
      await exportVitalsFile(exportFormat);
    } catch (exportIssue) {
      const message = exportIssue instanceof Error ? exportIssue.message : 'Unable to export vitals.';
      setExportError(message);
    }
  };

  const handleSubmissionChange = (event) => {
    const { name, value } = event.target;
    setSubmissionForm((prev) => ({ ...prev, [name]: value }));
    setSubmissionError('');
    setSubmissionSuccess('');
  };

  const handleSubmitVitals = async (event) => {
    event.preventDefault();
    setSubmissionError('');
    setSubmissionSuccess('');

    if (
      !submissionForm.date ||
      !submissionForm.time ||
      !submissionForm.systolic ||
      !submissionForm.diastolic ||
      !submissionForm.heartRate ||
      !submissionForm.temperature
    ) {
      setSubmissionError('Date, time, blood pressure, heart rate, and temperature are required.');
      return;
    }

    setSubmissionLoading(true);

    try {
      await createVitalSubmission({
        date: submissionForm.date,
        time: submissionForm.time,
        systolic: Number.parseInt(submissionForm.systolic, 10),
        diastolic: Number.parseInt(submissionForm.diastolic, 10),
        heart_rate: Number.parseInt(submissionForm.heartRate, 10),
        temperature: Number.parseFloat(submissionForm.temperature),
        spo2: Number.parseInt(submissionForm.spO2 || '0', 10),
        respiratory_rate: Number.parseInt(submissionForm.respiratoryRate || '0', 10),
        weight: Number.parseFloat(submissionForm.weight || '0'),
        height: Number.parseFloat(submissionForm.height || '0'),
        source_document_url: submissionForm.sourceDocumentUrl || null,
      });

      const rows = await fetchVitalSubmissions();
      const normalizedRows = Array.isArray(rows)
        ? [...rows].sort((a, b) => {
            const aTime = new Date(`${a.date || ''} ${a.time || ''}`).getTime();
            const bTime = new Date(`${b.date || ''} ${b.time || ''}`).getTime();
            return bTime - aTime;
          })
        : [];
      setSubmissions(normalizedRows);

      setSubmissionForm((prev) => ({
        ...INITIAL_SUBMISSION_FORM,
        date: prev.date,
        time: prev.time,
      }));
      setSubmissionSuccess('Vitals submitted successfully. A health admin will review your entry.');
      await reloadVitalsData();
    } catch (submitIssue) {
      setSubmissionError(
        submitIssue instanceof Error
          ? submitIssue.message
          : 'Unable to submit vitals right now.'
      );
    } finally {
      setSubmissionLoading(false);
    }
  };

  return (
    <Layout
      heroLabel="Analytics"
      heroTitle={<>All <span className={styles['hero__title--gold']}>Vital Signs</span></>}
      heroDesc="View your complete vital signs history."
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div className={styles.card} style={{ marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.35rem' }}>
              Submit Self-Reported Vitals
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
              New entries are queued for admin review before they appear in your official records.
            </p>
          </div>

          {submissionError && (
            <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{submissionError}</p>
          )}
          {submissionSuccess && (
            <p style={{ color: '#166534', marginBottom: '0.75rem' }}>{submissionSuccess}</p>
          )}

          <form onSubmit={handleSubmitVitals}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '0.75rem',
                marginBottom: '0.9rem',
              }}
            >
              <input name="date" type="date" value={submissionForm.date} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="time" type="time" value={submissionForm.time} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="systolic" type="number" placeholder="Systolic" value={submissionForm.systolic} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="diastolic" type="number" placeholder="Diastolic" value={submissionForm.diastolic} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="heartRate" type="number" placeholder="Heart Rate" value={submissionForm.heartRate} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="temperature" type="number" step="0.1" placeholder="Temperature" value={submissionForm.temperature} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="spO2" type="number" placeholder="SpO₂" value={submissionForm.spO2} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="respiratoryRate" type="number" placeholder="Resp. Rate" value={submissionForm.respiratoryRate} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="weight" type="number" step="0.1" placeholder="Weight (kg)" value={submissionForm.weight} onChange={handleSubmissionChange} style={submissionInputStyle} />
              <input name="height" type="number" step="0.1" placeholder="Height (cm)" value={submissionForm.height} onChange={handleSubmissionChange} style={submissionInputStyle} />
            </div>

            <input
              name="sourceDocumentUrl"
              type="url"
              placeholder="Optional source document URL"
              value={submissionForm.sourceDocumentUrl}
              onChange={handleSubmissionChange}
              style={{ ...submissionInputStyle, marginBottom: '0.9rem', width: '100%' }}
            />

            <button
              type="submit"
              className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--sm']}`}
              disabled={submissionLoading}
            >
              {submissionLoading ? 'Submitting...' : 'Submit For Review'}
            </button>
          </form>

          <div style={{ marginTop: '1.2rem' }}>
            <h4 style={{ marginBottom: '0.6rem', color: '#1f2937' }}>My Submission History</h4>

            {submissionsLoading && <p style={{ color: '#64748b' }}>Loading submissions...</p>}
            {submissionsError && <p style={{ color: '#dc2626' }}>{submissionsError}</p>}

            {!submissionsLoading && !submissionsError && (
              <div className={styles['table-wrapper']}>
                <table className={styles['vitals-table']}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>BP</th>
                      <th>Heart Rate</th>
                      <th>Temperature</th>
                      <th>Status</th>
                      <th>Admin Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission) => {
                      const statusBadge = getSubmissionStatusStyle(submission.status);
                      return (
                        <tr key={submission.id}>
                          <td>
                            {submission.date} {submission.time ? `at ${submission.time}` : ''}
                          </td>
                          <td>{submission.systolic}/{submission.diastolic}</td>
                          <td>{submission.heart_rate} bpm</td>
                          <td>{Number(submission.temperature).toFixed(1)} C</td>
                          <td>
                            <span
                              style={{
                                backgroundColor: statusBadge.bg,
                                color: statusBadge.text,
                                borderRadius: '999px',
                                padding: '4px 10px',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                              }}
                            >
                              {statusBadge.label}
                            </span>
                          </td>
                          <td>{submission.admin_notes || 'No notes yet'}</td>
                        </tr>
                      );
                    })}
                    {!submissions.length && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '18px' }}>
                          No self-reported submissions yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>All Vital Sign Records</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value)}
              aria-label="Export format"
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                padding: '6px 10px',
                fontSize: '0.875rem',
                color: '#1f2937',
                background: '#ffffff',
                minWidth: '96px',
              }}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
            <button
              type="button"
              onClick={reloadVitalsData}
              className={`${styles.btn} ${styles['btn--outline-navy']} ${styles['btn--sm']}`}
              disabled={loading}
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={handleExport}
              className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--sm']}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              disabled={loading || !tableRows.length}
            >
              <Download size={16} /> Export {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>

        {exportError && (
          <div style={{ marginBottom: '12px', color: '#dc2626', fontSize: '0.9rem' }}>{exportError}</div>
        )}

        <div className={styles['card-grid']} style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{summary.avgSystolic} mmHg</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Systolic</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{summary.avgDiastolic} mmHg</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Diastolic</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{summary.avgHeartRate} bpm</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Heart Rate</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{summary.avgTemp} C</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Temperature</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{summary.avgSpO2}%</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg SpO2</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{summary.avgBMI || 0}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg BMI</p>
          </div>
        </div>

        <div className={styles['search-filters']}>
          <div className={styles['search-field']}>
            <Search size={16} />
            <input
              type="date"
              name="dateStart"
              placeholder="Start date"
              value={filters.dateStart}
              onChange={handleDateFilterChange}
            />
          </div>
          <div className={styles['search-field']}>
            <Search size={16} />
            <input
              type="date"
              name="dateEnd"
              placeholder="End date"
              value={filters.dateEnd}
              onChange={handleDateFilterChange}
            />
          </div>
        </div>

        {loading && <p style={{ marginBottom: '12px', color: '#64748b' }}>Loading vitals...</p>}
        {error && <p style={{ marginBottom: '12px', color: '#dc2626' }}>{error}</p>}

        <div className={styles['table-wrapper']}>
          <table className={styles['vitals-table']}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Blood Pressure</th>
                <th>Heart Rate</th>
                <th>Temperature</th>
                <th>SpO2</th>
                <th>Resp. Rate</th>
                <th>BMI</th>
                <th>Visit Type</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((vital) => (
                <tr key={vital.id}>
                  <td>{vital.date}</td>
                  <td><VitalValueTag type="bloodPressure" value={vital.bloodPressure} /></td>
                  <td><VitalValueTag type="heartRate" value={vital.heartRate} suffix=" bpm" /></td>
                  <td><VitalValueTag type="temperature" value={vital.temperature} suffix=" C" /></td>
                  <td><VitalValueTag type="spO2" value={vital.spO2} suffix="%" /></td>
                  <td><VitalValueTag type="respRate" value={vital.respRate} suffix=" bpm" /></td>
                  <td>
                    {vital.bmi !== null
                      ? <VitalValueTag type="bmi" value={vital.bmi} />
                      : <span style={{ color: '#64748b' }}>N/A</span>}
                  </td>
                  <td>{vital.visitType}</td>
                  <td>{vital.staffName}</td>
                </tr>
              ))}
              {!loading && !tableRows.length && (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#64748b', padding: '18px' }}>
                    No vital records found for the selected range.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default AnalyticsPage;
