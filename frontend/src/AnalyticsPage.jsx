import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

const AnalyticsPage = () => {
  const [vitalFilters, setVitalFilters] = useState({
    date: ''
  });

  // VITALS DATA
  const allVitalsData = [
    {
      date: "Mar 11, 2026",
      bloodPressure: "130/85",
      heartRate: "78",
      temperature: "36.6",
      spO2: "97%",
      respRate: "16",
      bmi: "25.4",
      visitType: "Check-up",
      staffName: "Dr. Maria Santos"
    },
    {
      date: "Feb 10, 2026",
      bloodPressure: "128/82",
      heartRate: "75",
      temperature: "36.4",
      spO2: "98%",
      respRate: "15",
      bmi: "25.2",
      visitType: "Consultation",
      staffName: "Nurse Ana Reyes"
    },
    {
      date: "Jan 15, 2026",
      bloodPressure: "132/88",
      heartRate: "80",
      temperature: "36.8",
      spO2: "96%",
      respRate: "17",
      bmi: "25.6",
      visitType: "Check-up",
      staffName: "Dr. Juan dela Cruz"
    },
    {
      date: "Dec 20, 2025",
      bloodPressure: "135/90",
      heartRate: "82",
      temperature: "37.0",
      spO2: "95%",
      respRate: "18",
      bmi: "25.8",
      visitType: "Follow-up",
      staffName: "Dr. Maria Santos"
    },
    {
      date: "Nov 5, 2025",
      bloodPressure: "130/85",
      heartRate: "78",
      temperature: "36.6",
      spO2: "97%",
      respRate: "16",
      bmi: "25.4",
      visitType: "Immunization",
      staffName: "Nurse Ana Reyes"
    },
    {
      date: "Oct 12, 2025",
      bloodPressure: "128/82",
      heartRate: "76",
      temperature: "36.5",
      spO2: "98%",
      respRate: "15",
      bmi: "25.3",
      visitType: "Consultation",
      staffName: "Dr. Juan dela Cruz"
    },
  ];

  // FILTERED DATA
  const filteredVitals = allVitalsData.filter(vital => {
    return !vitalFilters.date || vital.date.includes(vitalFilters.date);
  });

  const handleVitalFilterChange = (e) => {
    setVitalFilters({
      ...vitalFilters,
      [e.target.name]: e.target.value
    });
  };

  // Calculate vital statistics
  const avgSystolic = (allVitalsData.reduce((sum, v) => sum + parseInt(v.bloodPressure.split('/')[0]), 0) / allVitalsData.length).toFixed(0);
  const avgDiastolic = (allVitalsData.reduce((sum, v) => sum + parseInt(v.bloodPressure.split('/')[1]), 0) / allVitalsData.length).toFixed(0);
  const avgHeartRate = (allVitalsData.reduce((sum, v) => sum + parseInt(v.heartRate), 0) / allVitalsData.length).toFixed(0);
  const avgTemp = (allVitalsData.reduce((sum, v) => sum + parseFloat(v.temperature), 0) / allVitalsData.length).toFixed(1);
  const avgSpO2 = (allVitalsData.reduce((sum, v) => sum + parseInt(v.spO2), 0) / allVitalsData.length).toFixed(1);
  const avgBMI = (allVitalsData.reduce((sum, v) => sum + parseFloat(v.bmi), 0) / allVitalsData.length).toFixed(1);

  const getVitalTag = (type, value) => {
    let status = 'Normal';

    if (type === 'bloodPressure') {
      const [sys, dia] = value.split('/').map(Number);
      if (sys >= 140 || dia >= 90) status = 'Abnormal';
      else if (sys >= 120 || dia >= 80) status = 'Elevated';
    } else if (type === 'heartRate') {
      const hr = Number(value);
      if (hr < 60 || hr > 100) status = 'Abnormal';
      else if (hr > 90) status = 'Elevated';
    } else if (type === 'temperature') {
      const temp = parseFloat(value);
      if (temp >= 38.0 || temp < 35.0) status = 'Abnormal';
      else if (temp >= 37.5) status = 'Elevated';
    } else if (type === 'spO2') {
      const spo2 = parseInt(value);
      if (spo2 < 92) status = 'Abnormal';
      else if (spo2 < 95) status = 'Elevated';
    } else if (type === 'respRate') {
      const rr = Number(value);
      if (rr < 12 || rr > 25) status = 'Abnormal';
      else if (rr > 20) status = 'Elevated';
    } else if (type === 'bmi') {
      const bmiVal = parseFloat(value);
      if (bmiVal >= 30) status = 'Abnormal';
      else if (bmiVal >= 25 || bmiVal < 18.5) status = 'Elevated';
    }

    let bgColor = '#d1fae5';
    let color = '#10b981';
    if (status === 'Elevated') {
      bgColor = '#fef3c7';
      color = '#d97706';
    } else if (status === 'Abnormal') {
      bgColor = '#fee2e2';
      color = '#dc2626';
    }

    return (
      <span style={{
        backgroundColor: bgColor,
        color: color,
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '0.85rem',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        {value}
      </span>
    );
  };

  const getAvgColor = (type, valStr) => {
    // Reuse some logic to color the card text natively without the pill background
    let status = 'Normal';
    if (type === 'bloodPressure') {
      const sys = parseInt(valStr);
      if (sys >= 140) status = 'Abnormal';
      else if (sys >= 120) status = 'Elevated';
    } else if (type === 'heartRate') {
      const hr = parseInt(valStr);
      if (hr < 60 || hr > 100) status = 'Abnormal';
      else if (hr > 90) status = 'Elevated';
    } else if (type === 'temperature') {
      const temp = parseFloat(valStr);
      if (temp >= 38.0 || temp < 35.0) status = 'Abnormal';
      else if (temp >= 37.5) status = 'Elevated';
    } else if (type === 'spO2') {
      const spo2 = parseInt(valStr);
      if (spo2 < 92) status = 'Abnormal';
      else if (spo2 < 95) status = 'Elevated';
    } else if (type === 'bmi') {
      const bmiVal = parseFloat(valStr);
      if (bmiVal >= 30) status = 'Abnormal';
      else if (bmiVal >= 25 || bmiVal < 18.5) status = 'Elevated';
    }

    if (status === 'Elevated') return '#d97706';
    if (status === 'Abnormal') return '#dc2626';
    return '#1e3a8a'; // Normal text color usually navy blue
  };

  return (
    <Layout
      heroLabel="Analytics"
      heroTitle={<>All <span className={styles['hero__title--gold']}>Vital Signs</span></>}
      heroDesc="View your complete vital signs history."
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>All Vital Sign Records</h3>
          <button className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--sm']}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={16} /> Export
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className={styles['card-grid']} style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: getAvgColor('bloodPressure', avgSystolic), marginBottom: '2px' }}>{avgSystolic} mmHg</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Systolic</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '2px' }}>{avgDiastolic} mmHg</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Diastolic</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: getAvgColor('heartRate', avgHeartRate), marginBottom: '2px' }}>{avgHeartRate} bpm</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Heart Rate</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: getAvgColor('temperature', avgTemp), marginBottom: '2px' }}>{avgTemp} ┬░C</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg Temp</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: getAvgColor('spO2', avgSpO2), marginBottom: '2px' }}>{avgSpO2}%</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg SpOΓéé</p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: '700', color: getAvgColor('bmi', avgBMI), marginBottom: '2px' }}>{avgBMI}</p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Avg BMI</p>
          </div>
        </div>

        {/* SEARCH FILTERS */}
        <div className={styles['search-filters']}>
          <div className={styles['search-field']}>
            <Search size={16} />
            <input
              type="date"
              name="date"
              placeholder="Filter by date"
              value={vitalFilters.date}
              onChange={handleVitalFilterChange}
            />
          </div>

        </div>

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
                <th>Staff Name</th>
              </tr>
            </thead>
            <tbody>
              {filteredVitals.map((vital, idx) => (
                <tr key={idx}>
                  <td>{vital.date}</td>
                  <td>{getVitalTag('bloodPressure', vital.bloodPressure)}</td>
                  <td>{getVitalTag('heartRate', vital.heartRate)}</td>
                  <td>{getVitalTag('temperature', vital.temperature)}</td>
                  <td>{getVitalTag('spO2', vital.spO2)}</td>
                  <td>{getVitalTag('respRate', vital.respRate)}</td>
                  <td>{getVitalTag('bmi', vital.bmi)}</td>
                  <td>{vital.visitType}</td>
                  <td>{vital.staffName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </Layout>
  );
};

export default AnalyticsPage;
