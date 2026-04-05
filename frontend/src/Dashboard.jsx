import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Thermometer, HeartPulse, Scale, Activity } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const fullName = user.first_name ? `${user.first_name} ${user.last_name}` : "User";
  const summaryData = [
    { title: "2 weeks", sub: "Before follow-up", date: "March 11, 2026", icon: <span style={{ fontSize: 18 }}>📅</span>, color: "#eef2ff" },
    { title: "3", sub: "Vitals recorded", date: "This February", icon: <span style={{ fontSize: 18 }}>📈</span>, color: "#f0fdf4" },
    { title: "3", sub: "Medical records made", date: "This February", icon: <span style={{ fontSize: 18 }}>📄</span>, color: "#fffbeb" },
    { title: "2 out of 3", sub: "Appointments accomplished", date: "This February", icon: <span style={{ fontSize: 18 }}>✅</span>, color: "#fef2f2" },
  ];

  // Updated to include icons to make mapping easier
  const vitalsData = [
    { title: "Blood Pressure", value: "130/85", unit: "mmHg", icon: <Activity size={16}/>, status: "Elevated" },
    { title: "Heart Rate", value: "78", unit: "bpm", icon: <Heart size={16}/>, status: "Normal" },
    { title: "Temperature", value: "36.6", unit: "°C", icon: <Thermometer size={16}/>, status: "Normal" },
    { title: "SpO2", value: "97%", unit: "Oxygen Sat.", icon: <HeartPulse size={16}/>, status: "Normal" },
    { title: "Resp. Rate", value: "16", unit: "breaths/min", icon: <Activity size={16}/>, status: "Normal" },
    { title: "BMI", value: "25.4", unit: "63.5 kg / 158 cm", icon: <Scale size={16}/>, status: "Elevated" },
  ];

  const [activeMetric, setActiveMetric] = useState('BP');
  const [dateRange, setDateRange] = useState('3M');

  const metricData = {
    'BP': [
      { date: "May 1", timestamp: new Date("2025-05-01").getTime(), systolic: 130, diastolic: 85 },
      { date: "May 15", timestamp: new Date("2025-05-15").getTime(), systolic: 128, diastolic: 82 },
      { date: "Jun 5", timestamp: new Date("2025-06-05").getTime(), systolic: 134, diastolic: 88, event: { icon: "🏃", note: "Started jogging routine" } },
      { date: "Jun 12", timestamp: new Date("2025-06-12").getTime(), systolic: 135, diastolic: 86 },
      { date: "Jun 19", timestamp: new Date("2025-06-19").getTime(), systolic: 132, diastolic: 84 },
      { date: "Jun 26", timestamp: new Date("2025-06-26").getTime(), systolic: 128, diastolic: 82 },
      { date: "Jul 3", timestamp: new Date("2025-07-03").getTime(), systolic: 130, diastolic: 83, event: { icon: "💊", note: "Medication adjusted" } },
      { date: "Jul 10", timestamp: new Date("2025-07-10").getTime(), systolic: 127, diastolic: 81 },
      { date: "Jul 17", timestamp: new Date("2025-07-17").getTime(), systolic: 126, diastolic: 80 },
      { date: "Jul 22", timestamp: new Date("2025-07-22").getTime(), systolic: 130, diastolic: 85 }
    ],
    'Heart Rate': [
      { date: "May 1", timestamp: new Date("2025-05-01").getTime(), value: 80 },
      { date: "May 15", timestamp: new Date("2025-05-15").getTime(), value: 82 },
      { date: "Jun 5", timestamp: new Date("2025-06-05").getTime(), value: 78, event: { icon: "🏃", note: "Started jogging" } },
      { date: "Jun 12", timestamp: new Date("2025-06-12").getTime(), value: 79 },
      { date: "Jun 19", timestamp: new Date("2025-06-19").getTime(), value: 85, event: { icon: "☕", note: "High caffeine intake" } },
      { date: "Jun 26", timestamp: new Date("2025-06-26").getTime(), value: 76 },
      { date: "Jul 3", timestamp: new Date("2025-07-03").getTime(), value: 75 },
      { date: "Jul 10", timestamp: new Date("2025-07-10").getTime(), value: 74 },
      { date: "Jul 17", timestamp: new Date("2025-07-17").getTime(), value: 72 },
      { date: "Jul 22", timestamp: new Date("2025-07-22").getTime(), value: 73 }
    ],
    'Weight': [
      { date: "May 1", timestamp: new Date("2025-05-01").getTime(), value: 65.5 },
      { date: "May 15", timestamp: new Date("2025-05-15").getTime(), value: 65.3 },
      { date: "Jun 5", timestamp: new Date("2025-06-05").getTime(), value: 65.0 },
      { date: "Jun 26", timestamp: new Date("2025-06-26").getTime(), value: 64.5, event: { icon: "🥗", note: "New diet plan" } },
      { date: "Jul 10", timestamp: new Date("2025-07-10").getTime(), value: 64.2 },
      { date: "Jul 22", timestamp: new Date("2025-07-22").getTime(), value: 63.8 }
    ],
    'SpO2': [
      { date: "May 1", timestamp: new Date("2025-05-01").getTime(), value: 98 },
      { date: "Jun 5", timestamp: new Date("2025-06-05").getTime(), value: 97 },
      { date: "Jul 3", timestamp: new Date("2025-07-03").getTime(), value: 98 },
      { date: "Jul 22", timestamp: new Date("2025-07-22").getTime(), value: 99 }
    ]
  };

  const getFilteredData = () => {
    const data = metricData[activeMetric] || [];
    const now = new Date("2025-07-22").getTime(); // Mock current date ends around here
    let cutoff = 0;
    
    if (dateRange === '1W') cutoff = now - 7 * 24 * 60 * 60 * 1000;
    else if (dateRange === '1M') cutoff = now - 30 * 24 * 60 * 60 * 1000;
    else if (dateRange === '3M') cutoff = now - 90 * 24 * 60 * 60 * 1000;
    else if (dateRange === '1Y') cutoff = now - 365 * 24 * 60 * 60 * 1000;
    
    return data.filter(d => d.timestamp >= cutoff);
  };

  const metricConfigs = {
    'BP': {
      lines: [
        { key: 'systolic', color: '#ef4444', label: 'Systolic' },
        { key: 'diastolic', color: '#2563eb', label: 'Diastolic' }
      ],
      unit: 'mmHg',
      title: 'Blood Pressure History'
    },
    'Heart Rate': {
      lines: [
        { key: 'value', color: '#10b981', label: 'Heart Rate' }
      ],
      unit: 'bpm',
      title: 'Heart Rate History'
    },
    'Weight': {
      lines: [
        { key: 'value', color: '#f59e0b', label: 'Weight' }
      ],
      unit: 'kg',
      title: 'Weight History'
    },
    'SpO2': {
      lines: [
        { key: 'value', color: '#8b5cf6', label: 'Oxygen Sat.' }
      ],
      unit: '%',
      title: 'SpO2 History'
    }
  };

  const LineChart = ({ data, config, width = 640, height = 220 }) => {
    const [hoverIndex, setHoverIndex] = React.useState(null);

    const padding = 30;
    const paddingBottom = 40;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding - paddingBottom;
    
    if (!data || data.length === 0) return <div style={{height, display:'flex', alignItems:'center', justifyContent:'center'}}>No data for this range</div>;

    const allValues = data.flatMap(d => config.lines.map(line => d[line.key]));
    // Add small padding to domain to prevent dots from getting clipped exactly on bottom or top
    const rawMax = Math.max(...allValues);
    const rawMin = Math.min(...allValues);
    const valuePadding = (rawMax - rawMin) * 0.1 || 1; 
    const max = rawMax + valuePadding;
    const min = rawMin - valuePadding;
    const range = max - min || 1;

    const toX = (index) => padding + (innerWidth * index) / (data.length - 1 || 1);
    const toY = (value) => padding + innerHeight - ((value - min) / range) * innerHeight;

    const buildPath = (key) =>
      data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(d[key])}`).join(" ");

    const hoveredItem = hoverIndex !== null ? data[hoverIndex] : null;

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Health metric history">
        <rect x="0" y="0" width={width} height={height} fill="transparent" />

        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding + innerHeight * t;
          return (
            <line key={t} x1={padding} x2={padding + innerWidth} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
          );
        })}

        {/* Dynamic Lines */}
        {config.lines.map(line => (
          <path key={line.key} d={buildPath(line.key)} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" />
        ))}

        {/* Data Dots & Hover Detection */}
        {data.map((d, i) => {
          const isHovered = i === hoverIndex;
          return (
            <g key={d.date} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} style={{ cursor: 'pointer' }}>
              {/* Invisible large circle for easier hovering */}
              <circle cx={toX(i)} cy={padding + innerHeight/2} r={30} fill="transparent" />
              
              {config.lines.map(line => (
                <circle key={line.key} cx={toX(i)} cy={toY(d[line.key])} r={isHovered ? 6 : 4} fill={line.color} stroke="#fff" strokeWidth="2" />
              ))}
              
              {/* Event Markers on X Axis */}
              {d.event && (
                <g transform={`translate(${toX(i)}, ${height - 24})`}>
                   <circle cx="0" cy="-6" r="10" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1"/>
                   <text x="0" y="-3" fontSize="12" textAnchor="middle">{d.event.icon}</text>
                </g>
              )}

              {/* x-axis labels */}
              <text x={toX(i)} y={height - 6} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">
                {d.date}
              </text>
            </g>
          );
        })}

        {/* Dynamic Tooltip */}
        {hoveredItem && (() => {
          const x = toX(hoverIndex);
          const yValues = config.lines.map(l => toY(hoveredItem[l.key]));
          const avgY = Math.min(...yValues) - 45;
          const tooltipWidth = 160;
          const tooltipHeight = 50 + (config.lines.length * 16) + (hoveredItem.event ? 24 : 0);
          
          let ty = Math.max(padding + 8, avgY);
          if (ty + tooltipHeight > height) ty = height - tooltipHeight - 10;
          let tx = x - tooltipWidth / 2;
          if (tx < padding) tx = padding;
          if (tx + tooltipWidth > width - padding) tx = width - padding - tooltipWidth;

          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={tx} y={ty} width={tooltipWidth} height={tooltipHeight} rx={8} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="drop-shadow(0 4px 12px rgba(0,0,0,0.15))" />
              <text x={tx + 14} y={ty + 22} fontSize="12" fill="#0f172a" fontWeight="700">
                {hoveredItem.date}
              </text>
              {config.lines.map((l, idx) => (
                <text key={l.key} x={tx + 14} y={ty + 44 + (idx * 16)} fontSize="12" fill={l.color} fontWeight="600">
                  {l.label}: {hoveredItem[l.key]} {config.unit}
                </text>
              ))}
              {hoveredItem.event && (
                <text x={tx + 14} y={ty + 44 + (config.lines.length * 16) + 8} fontSize="11" fill="#475569" fontStyle="italic">
                  {hoveredItem.event.icon} {hoveredItem.event.note}
                </text>
              )}
            </g>
          );
        })()}
      </svg>
    );
  };

  const appointmentsData = [
    { appointmentType: "Check-up", dateTime: "Mar 11, 2026 - 2:00 PM", status: "Confirmed", healthArea: "General", statusColor: "#10b981" },
    { appointmentType: "Follow-up", dateTime: "Mar 18, 2026 - 10:30 AM", status: "Confirmed", healthArea: "Dental", statusColor: "#10b981" },
    { appointmentType: "Immunization", dateTime: "Mar 25, 2026 - 3:15 PM", status: "Pending", healthArea: "Immunization", statusColor: "#f59e0b" },
    { appointmentType: "consultation", dateTime: "Feb 10, 2026 - 11:00 AM", status: "Completed", healthArea: "Family Planning", statusColor: "#6b7280" },
  ];

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
            <span style={{ fontSize: '0.8rem', color: '#666' }}>Recorded: Jul 22, 2025 at 9:30 AM</span>
            <Link to="/analytics" className={styles['card-grid__link']}>View all</Link>
          </div>
        </div>

        <div className={`${styles['card-grid']} ${styles['card-grid--3']}`}>
          {vitalsData.map((vital, idx) => {
            let statusColor = '#10b981'; // Normal (Green)
            let statusBg = '#d1fae5';
            
            if (vital.status === 'Elevated') {
              statusColor = '#d97706'; // Yellow
              statusBg = '#fef3c7';
            } else if (vital.status === 'Abnormal') {
              statusColor = '#dc2626'; // Red
              statusBg = '#fee2e2';
            }

            return (
              <div key={idx} className={`${styles.card} ${styles['card--vital']}`} style={{ backgroundColor: 'white', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: statusBg, color: statusColor, padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                  {vital.status}
                </div>
                <div className={styles.card__header} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#2E5895' }}>
                  {vital.icon}
                  <span className={styles.card__label} style={{ fontWeight: '600', fontSize: '0.9rem' }}>{vital.title}</span>
                </div>
                <div className={styles.card__body}>
                  <h2 className={styles.card__value} style={{ fontSize: '2rem', margin: '0', color: vital.status === 'Elevated' ? '#d97706' : (vital.status === 'Abnormal' ? '#dc2626' : '#2E5895') }}>{vital.value}</h2>
                  <p className={styles.card__unit} style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0' }}>{vital.unit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={`${styles.section} ${styles['section--white']}`}>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          {/* Main Chart Card (70%) */}
          <div className={`${styles.card} ${styles['chart-card']}`} style={{ flex: '1 1 65%', padding: '24px', minWidth: '400px' }}>
            {/* Header / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className={styles['subsection-header__title']} style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{metricConfigs[activeMetric].title}</h3>
                
                {/* Metric Toggles */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {Object.keys(metricConfigs).map(metric => (
                    <button
                      key={metric}
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
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {metric}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Filter */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {['1W', '1M', '3M', '1Y', 'All'].map(range => (
                  <button
                    key={range}
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
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart */}
            <LineChart data={getFilteredData()} config={metricConfigs[activeMetric]} width={640} height={260} />
            
            {/* Chart Legend */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '4px', marginBottom: '16px' }}>
              {metricConfigs[activeMetric].lines.map(line => (
                <div key={line.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 100, backgroundColor: line.color, border: '2px solid white', boxShadow: '0 0 0 1px #cbd5e1' }} />
                  <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '500' }}>{line.label}</span>
                </div>
              ))}
            </div>
            
            {/* Summary Stats Horizontal Row */}
            <div style={{ borderTop: '1px solid #e2e8f0', marginTop: '16px', paddingTop: '20px', display: 'flex', justifyContent: 'space-around', gap: '16px', flexWrap: 'wrap' }}>
              {(() => {
                const data = getFilteredData();
                if (!data.length) return null;
                const config = metricConfigs[activeMetric];
                
                let avgText, highText, lowText;
                
                if (activeMetric === 'BP') {
                   const avgSys = Math.round(data.reduce((acc, d) => acc + d.systolic, 0) / data.length);
                   const avgDia = Math.round(data.reduce((acc, d) => acc + d.diastolic, 0) / data.length);
                   avgText = `${avgSys}/${avgDia} ${config.unit}`;
                   
                   const highObj = data.reduce((max, d) => d.systolic > max.systolic ? d : max, data[0]);
                   highText = `${highObj.systolic}/${highObj.diastolic} (${highObj.date})`;
                   
                   const lowObj = data.reduce((min, d) => d.systolic < min.systolic ? d : min, data[0]);
                   lowText = `${lowObj.systolic}/${lowObj.diastolic} (${lowObj.date})`;
                } else {
                   const key = config.lines[0].key;
                   const avg = (data.reduce((acc, d) => acc + d[key], 0) / data.length).toFixed(1);
                   avgText = `${avg} ${config.unit}`;
                   
                   const highObj = data.reduce((max, d) => d[key] > max[key] ? d : max, data[0]);
                   highText = `${highObj[key]} ${config.unit} (${highObj.date})`;
                   
                   const lowObj = data.reduce((min, d) => d[key] < min[key] ? d : min, data[0]);
                   lowText = `${lowObj[key]} ${config.unit} (${lowObj.date})`;
                }

                return (
                  <>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Average</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{avgText}</span>
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Highest</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{highText}</span>
                    </div>
                    <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>Lowest</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{lowText}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Smart Insights Panel (30%) */}
          <div className={`${styles.card} ${styles['insights-card']}`} style={{ flex: '1 1 30%', padding: '24px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', minWidth: '280px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1e3a8a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ background: '#dbeafe', padding: '6px', borderRadius: '8px' }}>💡</span> 
              Smart Insights
            </h3>
            
            {(() => {
              let trendMsg = "";
              let targetColor = '#10b981';
              let targetLabel = 'Normal Range';
              let targetBg = '#d1fae5';
              let targetNote = 'Based on your age group averages.';
              
              if (activeMetric === 'BP') {
                 trendMsg = "Your Systolic pressure has decreased by 2.3% compared to the previous period. Great job managing it!";
                 targetColor = '#d97706';
                 targetBg = '#fef3c7';
                 targetLabel = 'Slightly Elevated';
              } else if (activeMetric === 'Heart Rate') {
                 trendMsg = "Your resting heart rate is highly consistent and shows no irregularities.";
              } else if (activeMetric === 'Weight') {
                 trendMsg = "You have lost 1.7kg over this period. Tracking perfectly with your fitness goals!";
              } else if (activeMetric === 'SpO2') {
                 trendMsg = "Oxygen saturation is optimal and stable between 97% and 99%.";
              }

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trend Analysis</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#1e293b', lineHeight: 1.5 }}>
                      {trendMsg}
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${targetColor}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Status</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ padding: '6px 12px', backgroundColor: targetBg, color: targetColor, borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700' }}>
                        {targetLabel}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', lineHeight: 1.4 }}>
                      {targetNote}
                    </p>
                  </div>
                  
                  {/* <div style={{ marginTop: 'auto', paddingTop: '24px', textAlign: 'center' }}>
                     <button className={`${styles.btn} ${styles['btn--primary']}`} style={{ width: '100%', padding: '12px', fontWeight: '600' }}>Consult Doctor about {activeMetric}</button>
                  </div> */}
                </div>
              );
            })()}
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
                        backgroundColor: apt.statusColor + '20',
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

const NavItem = ({ icon, label }) => (
  <div className={styles.sidebar__item}>
    {React.cloneElement(icon, { size: 24 })}
    <span>{label}</span>
  </div>
);

export default Dashboard;