import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';

import Layout from './Layout.jsx';
import usePatientVitalsData from './hooks/usePatientVitalsData';
import styles from './user_dashboard.module.css';
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

const AnalyticsPage = () => {
  const [exportError, setExportError] = useState('');
  const [exportFormat, setExportFormat] = useState('csv');
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

  return (
    <Layout
      heroLabel="Analytics"
      heroTitle={<>All <span className={styles['hero__title--gold']}>Vital Signs</span></>}
      heroDesc="View your complete vital signs history."
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
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
