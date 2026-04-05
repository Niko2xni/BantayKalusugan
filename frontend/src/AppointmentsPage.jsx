import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

const AppointmentsPage = () => {
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    healthArea: ''
  });

  const allAppointmentsData = [
    { appointmentType: "Check-up", dateTime: "Mar 11, 2026 - 2:00 PM", status: "Confirmed", healthArea: "General", statusColor: "#10b981" },
    { appointmentType: "Follow-up", dateTime: "Mar 18, 2026 - 10:30 AM", status: "Confirmed", healthArea: "Dental", statusColor: "#10b981" },
    { appointmentType: "Immunization", dateTime: "Mar 25, 2026 - 3:15 PM", status: "Pending", healthArea: "Immunization", statusColor: "#f59e0b" },
    { appointmentType: "Consultation", dateTime: "Feb 10, 2026 - 11:00 AM", status: "Completed", healthArea: "Family Planning", statusColor: "#6b7280" },
    { appointmentType: "Check-up", dateTime: "Jan 15, 2026 - 9:00 AM", status: "Completed", healthArea: "General", statusColor: "#6b7280" },
    { appointmentType: "Follow-up", dateTime: "Dec 20, 2025 - 1:30 PM", status: "Completed", healthArea: "TB", statusColor: "#6b7280" },
    { appointmentType: "Immunization", dateTime: "Nov 5, 2025 - 4:00 PM", status: "Completed", healthArea: "Immunization", statusColor: "#6b7280" },
    { appointmentType: "Consultation", dateTime: "Oct 12, 2025 - 10:15 AM", status: "Cancelled", healthArea: "Dental", statusColor: "#ef4444" },
  ];

  const filteredAppointments = allAppointmentsData.filter(apt => {
    const matchesDate = !filters.date || apt.dateTime.includes(filters.date);
    const matchesStatus = !filters.status || apt.status.toLowerCase() === filters.status.toLowerCase();
    const matchesArea = !filters.healthArea || apt.healthArea.toLowerCase().includes(filters.healthArea.toLowerCase());
    return matchesDate && matchesStatus && matchesArea;
  });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout
      heroLabel="Appointments"
      heroTitle={<>All <span className={styles['hero__title--gold']}>Appointments</span></>}
      heroDesc="View and manage your appointment history."
    >
      <div className={styles.container}>
        <section className={`${styles.section} ${styles['section--white']}`}>
          <div className={styles['subsection-header']}>
            <h3 className={styles['subsection-header__title']}>Past Appointments</h3>
          </div>

          {/* SEARCH FILTERS */}
          <div className={styles['search-filters']}>
            <div className={styles['search-field']}>
              <Search size={16} />
              <input
                type="date"
                name="date"
                placeholder="Filter by date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
            <div className={styles['search-field']}>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className={styles['search-field']}>
              <select name="healthArea" value={filters.healthArea} onChange={handleFilterChange}>
                <option value="">All Areas</option>
                <option value="general">General</option>
                <option value="dental">Dental</option>
                <option value="immunization">Immunization</option>
                <option value="family planning">Family Planning</option>
                <option value="tb">TB</option>
              </select>
            </div>
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
                {filteredAppointments.map((apt, idx) => (
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
                          display: 'inline-block'
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
      </div>
    </Layout>
  );
};

export default AppointmentsPage;