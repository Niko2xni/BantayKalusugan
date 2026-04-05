import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

const SchedulesPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [healthAreaFilter, setHealthAreaFilter] = useState('all');

  const allAppointmentsData = [
    { appointmentType: "Blood Pressure Check", status: "Confirmed", dateTime: "Mar 15, 2026", time: "10:00 AM", location: "Barangay Health Center", staff: "Admin Reyes", healthArea: "General", notes: "Bring previous BP records" },
    { appointmentType: "General Consultation", status: "Pending", dateTime: "Mar 22, 2026", time: "2:30 PM", location: "Barangay Health Center", staff: "Admin Santos", healthArea: "General", notes: "" },
    { appointmentType: "Follow-up", status: "Confirmed", dateTime: "Mar 18, 2026", time: "10:30 AM", location: "Barangay Health Center", staff: "Admin Reyes", healthArea: "General", notes: "" },
    { appointmentType: "Immunization", status: "Pending", dateTime: "Mar 25, 2026", time: "3:15 PM", location: "Barangay Health Center", staff: "Admin Santos", healthArea: "Immunization", notes: "" },
    { appointmentType: "Consultation", status: "Completed", dateTime: "Feb 10, 2026", time: "11:00 AM", location: "Barangay Health Center", staff: "Admin Santos", healthArea: "Family Planning", notes: "" },
    { appointmentType: "Check-up", status: "Completed", dateTime: "Jan 15, 2026", time: "9:00 AM", location: "Barangay Health Center", staff: "Admin Reyes", healthArea: "General", notes: "" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed':
        return { bg: '#d1fae5', text: '#065f46', icon: '#10b981' };
      case 'Pending':
        return { bg: '#fef3c7', text: '#78350f', icon: '#f59e0b' };
      case 'Completed':
        return { bg: '#e5e7eb', text: '#374151', icon: '#6b7280' };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#991b1b', icon: '#ef4444' };
      default:
        return { bg: '#f3f4f6', text: '#1f2937', icon: '#6b7280' };
    }
  };

  const getMonthDay = (dateString) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate()
    };
  };

  const filteredAppointments = allAppointmentsData.filter(apt => {
    const matchesStatus = activeFilter === 'all' || apt.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesArea = healthAreaFilter === 'all' || apt.healthArea.toLowerCase() === healthAreaFilter.toLowerCase();
    return matchesStatus && matchesArea;
  });

  const upcomingCount = allAppointmentsData.filter(a => a.status === 'Confirmed').length;
  const pendingCount = allAppointmentsData.filter(a => a.status === 'Pending').length;

  return (
    <Layout
      heroLabel="Schedules"
      heroTitle={<>My <span className={styles['hero__title--gold']}>Appointments</span></>}
      heroDesc="Manage your health check-up appointments"
    >
      <div className={styles.container}>
        <section className={`${styles.section} ${styles['section--white']}`}>
          {/* STATS CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#1e40af' }}>
                <Calendar size={32} color="#1e40af" />
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Upcoming</p>
                <p style={{ fontSize: '1.875rem', fontWeight: '600', margin: 0, color: '#1e40af' }}>{upcomingCount}</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '2rem', color: '#f59e0b' }}>
                <Clock size={32} color="#f59e0b" />
              </div>
              <div>
                <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0 0 4px 0' }}>Pending</p>
                <p style={{ fontSize: '1.875rem', fontWeight: '600', margin: 0, color: '#f59e0b' }}>{pendingCount}</p>
              </div>
            </div>
          </div>

          {/* FILTER BUTTONS */}
          <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ marginRight: '1rem', fontWeight: '500', color: '#6b7280', display: 'flex', alignItems: 'center' }}>Filter:</span>
            <button
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilter === 'all' ? '#1e3a8a' : '#f3f4f6',
                color: activeFilter === 'all' ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('confirmed')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilter === 'confirmed' ? '#1e3a8a' : '#f3f4f6',
                color: activeFilter === 'confirmed' ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Confirmed
            </button>
            <button
              onClick={() => setActiveFilter('pending')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilter === 'pending' ? '#1e3a8a' : '#f3f4f6',
                color: activeFilter === 'pending' ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveFilter('completed')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilter === 'completed' ? '#1e3a8a' : '#f3f4f6',
                color: activeFilter === 'completed' ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Completed
            </button>
            <select
              value={healthAreaFilter}
              onChange={(e) => setHealthAreaFilter(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#fff',
                color: '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="all">All Areas</option>
              <option value="General">General</option>
              <option value="Dental">Dental</option>
              <option value="Immunization">Immunization</option>
              <option value="Family Planning">Family Planning</option>
              <option value="TB">TB</option>
            </select>
          </div>

          {/* APPOINTMENTS LIST */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {filteredAppointments.map((apt, idx) => {
              const { month, day } = getMonthDay(apt.dateTime);
              const colors = getStatusColor(apt.status);
              return (
                <div
                  key={idx}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr auto',
                    gap: '1.5rem',
                    alignItems: 'start'
                  }}
                >
                  {/* DATE CARD */}
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: '#f3f4f6',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', margin: '0 0 4px 0' }}>
                      {month}
                    </p>
                    <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      {day}
                    </p>
                  </div>

                  {/* APPOINTMENT DETAILS */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                          {apt.appointmentType}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{apt.healthArea}</span>
                      </div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          backgroundColor: colors.bg,
                          color: colors.text
                        }}
                      >
                        {apt.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                        <Clock size={16} color="#6b7280" />
                        {apt.time}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                        <MapPin size={16} color="#6b7280" />
                        {apt.location}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                        <User size={16} color="#6b7280" />
                        {apt.staff}
                      </div>
                    </div>

                    {apt.notes && (
                      <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px', marginTop: '0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                          <span style={{ fontWeight: '600' }}>Notes:</span> {apt.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAppointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
              <p style={{ fontSize: '1rem' }}>No appointments found with the selected filter.</p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default SchedulesPage;
