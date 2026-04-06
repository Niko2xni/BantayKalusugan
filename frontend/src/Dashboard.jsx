import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Heart, HeartPulse, Scale, Thermometer } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { getStoredUser } from './utils/authSession';
import usePatientVitalsData from './hooks/usePatientVitalsData';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';
import {
  buildMetricSeries,
  calculateBmi,
  getDateStartIsoForRange,
  getStatusColors,
  getVitalStatus,
} from './utils/patientVitals';

const metricConfigs = {
  BP: {
    title: 'Blood Pressure History',
    unit: 'mmHg',
    lines: [
      { key: 'systolic', color: '#ef4444', label: 'Systolic' },
      { key: 'diastolic', color: '#2563eb', label: 'Diastolic' },
    ],
  },
  'Heart Rate': {
    title: 'Heart Rate History',
    unit: 'bpm',
    lines: [{ key: 'value', color: '#10b981', label: 'Heart Rate' }],
  },
  Weight: {
    title: 'Weight History',
    unit: 'kg',
    lines: [{ key: 'value', color: '#f59e0b', label: 'Weight' }],
  },
  SpO2: {
    title: 'SpO2 History',
    unit: '%',
    lines: [{ key: 'value', color: '#8b5cf6', label: 'SpO2' }],
  },
};

const appointmentsData = [
  { appointmentType: 'Check-up', dateTime: 'Mar 11, 2026 - 2:00 PM', status: 'Confirmed', healthArea: 'General', statusColor: '#10b981' },
  { appointmentType: 'Follow-up', dateTime: 'Mar 18, 2026 - 10:30 AM', status: 'Confirmed', healthArea: 'Dental', statusColor: '#10b981' },
  { appointmentType: 'Immunization', dateTime: 'Mar 25, 2026 - 3:15 PM', status: 'Pending', healthArea: 'Immunization', statusColor: '#f59e0b' },
  { appointmentType: 'Consultation', dateTime: 'Feb 10, 2026 - 11:00 AM', status: 'Completed', healthArea: 'Family Planning', statusColor: '#6b7280' },
];

function VitalCard({ title, value, unit, status, icon }) {
  const { bgColor, color } = getStatusColors(status);

  return (
    <div className={`${styles.card} ${styles['card--vital']}`} style={{ backgroundColor: 'white', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: bgColor, color, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
        {status}
      </div>
      <div className={styles.card__header} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#2E5895' }}>
        {icon}
        <span className={styles.card__label} style={{ fontWeight: '600', fontSize: '0.9rem' }}>{title}</span>
      </div>
      <div className={styles.card__body}>
        <h2 className={styles.card__value} style={{ fontSize: '2rem', margin: '0', color }}>
          {value}
        </h2>
        <p className={styles.card__unit} style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0' }}>{unit}</p>
      </div>
    </div>
  );
}

const Dashboard = () => {
  const user = getStoredUser() || {};
  const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : 'User';

  const [activeMetric, setActiveMetric] = useState('BP');
  const [dateRange, setDateRange] = useState('3M');

  const {
    vitals,
    latestVital,
    overview,
    loading,
    error,
    filters,
    setFilters,
    reloadVitalsData,
  } = usePatientVitalsData();

  useEffect(() => {
    const dateStart = getDateStartIsoForRange(dateRange);
    setFilters((prev) => ({
      ...prev,
      dateStart,
      dateEnd: '',
      limit: 500,
      skip: 0,
    }));
  }, [dateRange, setFilters]);

  const metricData = useMemo(() => buildMetricSeries(vitals), [vitals]);
  const activeMetricConfig = metricConfigs[activeMetric];
  const activeChartData = metricData[activeMetric] || [];

  const latest = vitals[0] || latestVital;
  const latestBmi = latest ? calculateBmi(latest.weight, latest.height) : null;

  const summaryData = [
    {
      title: overview ? String(overview.total_records) : String(vitals.length),
      sub: 'Vitals recorded',
      date: dateRange === 'All' ? 'All time' : `Last ${dateRange}`,
      icon: <span style={{ fontSize: 18 }}>📈</span>,
      color: '#eef2ff',
    },
    {
      title: overview ? `${Math.round(overview.avg_systolic)}/${Math.round(overview.avg_diastolic)}` : '--',
      sub: 'Average BP',
      date: `${activeMetricConfig.unit}`,
      icon: <span style={{ fontSize: 18 }}>💓</span>,
      color: '#f0fdf4',
    },
    {
      title: overview ? String(overview.elevated_bp_records) : '0',
      sub: 'Elevated BP records',
      date: dateRange === 'All' ? 'All time' : `Last ${dateRange}`,
      icon: <span style={{ fontSize: 18 }}>⚠️</span>,
      color: '#fffbeb',
    },
    {
      title: overview ? String(overview.abnormal_bp_records) : '0',
      sub: 'Abnormal BP records',
      date: dateRange === 'All' ? 'All time' : `Last ${dateRange}`,
      icon: <span style={{ fontSize: 18 }}>🚨</span>,
      color: '#fef2f2',
    },
  ];

  const latestCards = latest
    ? [
        {
          title: 'Blood Pressure',
          value: `${latest.systolic}/${latest.diastolic}`,
          unit: 'mmHg',
          status: getVitalStatus('bloodPressure', `${latest.systolic}/${latest.diastolic}`),
          icon: <Activity size={16} />,
        },
        {
          title: 'Heart Rate',
          value: `${latest.heart_rate}`,
          unit: 'bpm',
          status: getVitalStatus('heartRate', latest.heart_rate),
          icon: <Heart size={16} />,
        },
        {
          title: 'Temperature',
          value: `${Number(latest.temperature).toFixed(1)}`,
          unit: 'C',
          status: getVitalStatus('temperature', latest.temperature),
          icon: <Thermometer size={16} />,
        },
        {
          title: 'SpO2',
          value: `${latest.spo2}`,
          unit: '% oxygen sat',
          status: getVitalStatus('spO2', latest.spo2),
          icon: <HeartPulse size={16} />,
        },
        {
          title: 'Resp. Rate',
          value: `${latest.respiratory_rate}`,
          unit: 'breaths/min',
          status: getVitalStatus('respRate', latest.respiratory_rate),
          icon: <Activity size={16} />,
        },
        {
          title: 'BMI',
          value: latestBmi !== null ? `${latestBmi.toFixed(1)}` : '--',
          unit: `${Number(latest.weight).toFixed(1)} kg / ${Number(latest.height).toFixed(1)} cm`,
          status: latestBmi !== null ? getVitalStatus('bmi', latestBmi) : 'Normal',
          icon: <Scale size={16} />,
        },
      ]
    : [];

  const summaryStats = (() => {
    if (!activeChartData.length) {
      return null;
    }

    if (activeMetric === 'BP') {
      const avgSystolic = Math.round(
        activeChartData.reduce((sum, point) => sum + point.systolic, 0) / activeChartData.length
      );
      const avgDiastolic = Math.round(
        activeChartData.reduce((sum, point) => sum + point.diastolic, 0) / activeChartData.length
      );
      const high = activeChartData.reduce((max, point) => (point.systolic > max.systolic ? point : max), activeChartData[0]);
      const low = activeChartData.reduce((min, point) => (point.systolic < min.systolic ? point : min), activeChartData[0]);

      return {
        average: `${avgSystolic}/${avgDiastolic} ${activeMetricConfig.unit}`,
        highest: `${high.systolic}/${high.diastolic}`,
        lowest: `${low.systolic}/${low.diastolic}`,
      };
    }

    const values = activeChartData.map((point) => Number(point.value));
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      average: `${average.toFixed(1)} ${activeMetricConfig.unit}`,
      highest: `${Math.max(...values)} ${activeMetricConfig.unit}`,
      lowest: `${Math.min(...values)} ${activeMetricConfig.unit}`,
    };
  })();

  const insightsMessage = overview
    ? `You have ${overview.normal_bp_records} normal, ${overview.elevated_bp_records} elevated, and ${overview.abnormal_bp_records} abnormal blood pressure records in this range.`
    : 'Load your records to view personalized trend insights.';

  return (
    <Layout
      heroLabel="Patient Dashboard"
      heroTitle={
        <>
          Hello, <span className={styles['hero__title--gold']}>{fullName}</span>
        </>
      }
      heroDesc="Your health summary at a glance."
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div className={`${styles['card-grid']} ${styles['card-grid--4']}`}>
          {summaryData.map((item, idx) => (
            <div key={idx} className={styles.card}>
              <div className={styles.card__icon} style={{ backgroundColor: item.color }}>
                {item.icon}
              </div>
              <h3 className={styles.card__title}>{item.title}</h3>
              <p className={styles.card__desc}>{item.sub}</p>
              <p className={styles.card__desc} style={{ fontSize: '0.70rem', marginTop: '4px' }}>{item.date}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles['section--grey']}`}>
        <div className={styles['subsection-header']}>
          <h3 className={styles['subsection-header__title']}>Latest Vital Signs</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#666' }}>
              {latest ? `Recorded: ${latest.date} at ${latest.time}` : 'No records yet'}
            </span>
            <Link to="/analytics" className={styles['card-grid__link']}>View all</Link>
          </div>
        </div>

        {loading && <p style={{ marginBottom: '12px', color: '#64748b' }}>Loading latest vitals...</p>}
        {error && <p style={{ marginBottom: '12px', color: '#dc2626' }}>{error}</p>}

        <div className={`${styles['card-grid']} ${styles['card-grid--3']}`}>
          {latestCards.map((card) => (
            <VitalCard
              key={card.title}
              title={card.title}
              value={card.value}
              unit={card.unit}
              status={card.status}
              icon={card.icon}
            />
          ))}
          {!loading && !latestCards.length && (
            <div className={styles.card} style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b' }}>
              No vital records yet. Your dashboard updates automatically once records are available.
            </div>
          )}
        </div>
      </section>

      <section className={`${styles.section} ${styles['section--white']}`}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div className={`${styles.card} ${styles['chart-card']}`} style={{ flex: '1 1 65%', padding: '24px', minWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className={styles['subsection-header__title']} style={{ marginBottom: '12px', fontSize: '1.25rem' }}>
                  {activeMetricConfig.title}
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.keys(metricConfigs).map((metric) => (
                    <button
                      key={metric}
                      type="button"
                      onClick={() => setActiveMetric(metric)}
                      style={{
                        padding: '6px 16px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: activeMetric === metric ? '#1e3a8a' : '#cbd5e1',
                        backgroundColor: activeMetric === metric ? '#1e3a8a' : '#f8fafc',
                        color: activeMetric === metric ? 'white' : '#475569',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {['1W', '1M', '3M', '1Y', 'All'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setDateRange(range)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: dateRange === range ? 'white' : 'transparent',
                      color: dateRange === range ? '#0f172a' : '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: dateRange === range ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                Loading chart data...
              </div>
            ) : activeChartData.length ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    {activeMetricConfig.lines.map((line) => (
                      <Line
                        key={line.key}
                        type="monotone"
                        dataKey={line.key}
                        stroke={line.color}
                        strokeWidth={3}
                        dot={{ r: 3 }}
                        name={line.label}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                No chart data for this range.
              </div>
            )}

            {summaryStats && (
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '20px', display: 'flex', justifyContent: 'space-around', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Average</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{summaryStats.average}</span>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Highest</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{summaryStats.highest}</span>
                </div>
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                <div style={{ textAlign: 'center', flex: 1 }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Lowest</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{summaryStats.lowest}</span>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.card} ${styles['insights-card']}`} style={{ flex: '1 1 30%', padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#dbeafe', padding: '6px', borderRadius: '8px' }}>💡</span>
              Smart Insights
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trend Analysis</p>
                <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5 }}>{insightsMessage}</p>
              </div>
              <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10b981', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Window</p>
                <span style={{ padding: '6px 12px', backgroundColor: '#d1fae5', color: '#047857', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                  {dateRange === 'All' ? 'All Records' : `Last ${dateRange}`}
                </span>
                <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                  Filtered from {filters.dateStart || 'earliest'} to latest available record.
                </p>
              </div>
              <button
                type="button"
                onClick={reloadVitalsData}
                className={`${styles.btn} ${styles['btn--primary']}`}
                style={{ marginTop: 'auto' }}
              >
                Refresh Health Data
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles['section--white']}`}>
        <div className={styles['subsection-header']}>
          <h3 className={styles['subsection-header__title']}>Appointments</h3>
          <Link to="/schedules" className={styles['card-grid__link']}>View all</Link>
        </div>
        <div className={styles['table-wrapper']}>
          <table className={styles['appointments-table']}>
            <thead>
              <tr>
                <th>Appointment Type</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Area of Health</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsData.map((apt, idx) => (
                <tr key={idx}>
                  <td>{apt.appointmentType}</td>
                  <td>{apt.dateTime}</td>
                  <td>
                    <span
                      className={styles['status-badge']}
                      style={{
                        backgroundColor: `${apt.statusColor}20`,
                        color: apt.statusColor,
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        display: 'inline-block',
                      }}
                    >
                      {apt.status}
                    </span>
                  </td>
                  <td>{apt.healthArea}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
