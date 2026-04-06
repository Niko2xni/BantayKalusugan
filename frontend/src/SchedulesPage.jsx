import React, { useEffect, useMemo, useState } from 'react';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';
import {
  cancelAppointment,
  fetchAppointments,
  requestAppointment,
  rescheduleAppointment,
} from './utils/patientPortalApi';


function formatDateTime(isoString) {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return { date: 'Invalid date', time: '--:--' };
  }

  return {
    date: parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: parsed.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  };
}


function toDatetimeLocalValue(isoString) {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const tzOffset = parsed.getTimezoneOffset() * 60000;
  const localDate = new Date(parsed.getTime() - tzOffset);
  return localDate.toISOString().slice(0, 16);
}


function statusColor(status) {
  switch (status) {
    case 'Confirmed':
      return { bg: '#d1fae5', text: '#065f46' };
    case 'Pending':
      return { bg: '#fef3c7', text: '#78350f' };
    case 'Completed':
      return { bg: '#e5e7eb', text: '#374151' };
    case 'Cancelled':
      return { bg: '#fee2e2', text: '#991b1b' };
    default:
      return { bg: '#f3f4f6', text: '#1f2937' };
  }
}


const initialRequestForm = {
  appointmentType: 'General Consultation',
  healthArea: 'General',
  scheduledAt: '',
  location: 'Barangay Health Center',
  notes: '',
};

const SchedulesPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [healthAreaFilter, setHealthAreaFilter] = useState('all');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestForm, setRequestForm] = useState(initialRequestForm);
  const [requestMessage, setRequestMessage] = useState('');
  const [requestError, setRequestError] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [workingAppointmentId, setWorkingAppointmentId] = useState(null);
  const [rescheduleDraft, setRescheduleDraft] = useState({
    appointmentId: null,
    scheduledAt: '',
    notes: '',
    error: '',
  });


  const loadAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const rows = await fetchAppointments();
      setAppointments(Array.isArray(rows) ? rows : []);
    } catch (loadIssue) {
      setError(loadIssue instanceof Error ? loadIssue.message : 'Unable to load appointments.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadAppointments();
  }, []);


  const healthAreaOptions = useMemo(() => {
    const values = new Set(appointments.map((item) => item.health_area).filter(Boolean));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  }, [appointments]);


  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus =
      activeFilter === 'all' || apt.status.toLowerCase() === activeFilter.toLowerCase();
    const matchesArea =
      healthAreaFilter === 'all' || apt.health_area.toLowerCase() === healthAreaFilter.toLowerCase();
    return matchesStatus && matchesArea;
  });

  const upcomingCount = appointments.filter((a) => a.status === 'Confirmed').length;
  const pendingCount = appointments.filter((a) => a.status === 'Pending').length;


  const handleRequestFieldChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmitRequest = async (event) => {
    event.preventDefault();
    setSubmittingRequest(true);
    setRequestError('');
    setRequestMessage('');

    if (!requestForm.scheduledAt) {
      setSubmittingRequest(false);
      setRequestError('Please choose a schedule date and time.');
      return;
    }

    try {
      const payload = {
        appointment_type: requestForm.appointmentType,
        health_area: requestForm.healthArea,
        scheduled_at: new Date(requestForm.scheduledAt).toISOString(),
        location: requestForm.location,
        notes: requestForm.notes,
      };

      const created = await requestAppointment(payload);
      setAppointments((prev) => [...prev, created].sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)));
      setRequestMessage('Appointment request submitted successfully.');
      setRequestForm(initialRequestForm);
    } catch (submitIssue) {
      setRequestError(
        submitIssue instanceof Error ? submitIssue.message : 'Unable to submit appointment request.'
      );
    } finally {
      setSubmittingRequest(false);
    }
  };


  const handleCancelAppointment = async (appointmentId) => {
    setWorkingAppointmentId(appointmentId);
    setError('');
    try {
      const updated = await cancelAppointment(appointmentId);
      setAppointments((prev) => prev.map((item) => (item.id === appointmentId ? updated : item)));
    } catch (cancelIssue) {
      setError(cancelIssue instanceof Error ? cancelIssue.message : 'Unable to cancel appointment.');
    } finally {
      setWorkingAppointmentId(null);
    }
  };


  const beginReschedule = (appointment) => {
    setRescheduleDraft({
      appointmentId: appointment.id,
      scheduledAt: toDatetimeLocalValue(appointment.scheduled_at),
      notes: '',
      error: '',
    });
  };


  const handleApplyReschedule = async (appointmentId) => {
    if (!rescheduleDraft.scheduledAt) {
      setRescheduleDraft((prev) => ({ ...prev, error: 'Please select a new date and time.' }));
      return;
    }

    setWorkingAppointmentId(appointmentId);
    try {
      const updated = await rescheduleAppointment(appointmentId, {
        scheduled_at: new Date(rescheduleDraft.scheduledAt).toISOString(),
        notes: rescheduleDraft.notes,
      });

      setAppointments((prev) => prev.map((item) => (item.id === appointmentId ? updated : item)));
      setRescheduleDraft({ appointmentId: null, scheduledAt: '', notes: '', error: '' });
    } catch (rescheduleIssue) {
      setRescheduleDraft((prev) => ({
        ...prev,
        error: rescheduleIssue instanceof Error ? rescheduleIssue.message : 'Unable to reschedule appointment.',
      }));
    } finally {
      setWorkingAppointmentId(null);
    }
  };

  return (
    <Layout
      heroLabel="Schedules"
      heroTitle={<>My <span className={styles['hero__title--gold']}>Appointments</span></>}
      heroDesc="Manage your health check-up appointments"
    >
      <div className={styles.container}>
        <section className={`${styles.section} ${styles['section--white']}`}>
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

          <form onSubmit={handleSubmitRequest} className={styles.card} style={{ marginBottom: '1.5rem', padding: '1rem' }}>
            <h4 style={{ marginBottom: '0.8rem', color: '#1f2937' }}>Request an Appointment</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <input
                name="appointmentType"
                value={requestForm.appointmentType}
                onChange={handleRequestFieldChange}
                placeholder="Appointment type"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                name="healthArea"
                value={requestForm.healthArea}
                onChange={handleRequestFieldChange}
                placeholder="Health area"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                name="scheduledAt"
                type="datetime-local"
                value={requestForm.scheduledAt}
                onChange={handleRequestFieldChange}
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
              <input
                name="location"
                value={requestForm.location}
                onChange={handleRequestFieldChange}
                placeholder="Location"
                style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}
              />
            </div>
            <textarea
              name="notes"
              value={requestForm.notes}
              onChange={handleRequestFieldChange}
              placeholder="Additional notes"
              style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '0.75rem', fontFamily: 'inherit' }}
            />
            {requestError && <p style={{ color: '#dc2626', marginBottom: '0.5rem' }}>{requestError}</p>}
            {requestMessage && <p style={{ color: '#047857', marginBottom: '0.5rem' }}>{requestMessage}</p>}
            <button
              type="submit"
              className={`${styles.btn} ${styles['btn--primary']}`}
              disabled={submittingRequest}
            >
              {submittingRequest ? 'Submitting...' : 'Request Appointment'}
            </button>
          </form>

          <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ marginRight: '1rem', fontWeight: '500', color: '#6b7280', display: 'flex', alignItems: 'center' }}>Filter:</span>
            <button
              type="button"
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
              type="button"
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
              type="button"
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
              type="button"
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
            <button
              type="button"
              onClick={() => setActiveFilter('cancelled')}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeFilter === 'cancelled' ? '#1e3a8a' : '#f3f4f6',
                color: activeFilter === 'cancelled' ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              Cancelled
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
              {healthAreaOptions.map((area) => (
                <option key={area} value={area}>
                  {area === 'all' ? 'All Areas' : area}
                </option>
              ))}
            </select>
          </div>

          {loading && <p style={{ marginBottom: '1rem', color: '#64748b' }}>Loading appointments...</p>}
          {error && <p style={{ marginBottom: '1rem', color: '#dc2626' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            {filteredAppointments.map((apt) => {
              const { date, time } = formatDateTime(apt.scheduled_at);
              const month = date.split(' ')[0].toUpperCase();
              const day = date.split(' ')[1]?.replace(',', '') || '--';
              const colors = statusColor(apt.status);
              return (
                <div
                  key={apt.id}
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
                          {apt.appointment_type}
                        </h3>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{apt.health_area}</span>
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
                        {date} - {time}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                        <MapPin size={16} color="#6b7280" />
                        {apt.location || 'Barangay Health Center'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>
                        <User size={16} color="#6b7280" />
                        {apt.assigned_staff || 'Pending Assignment'}
                      </div>
                    </div>

                    {(apt.notes || apt.requested_notes) && (
                      <div style={{ backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px', marginTop: '0.75rem' }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151' }}>
                          <span style={{ fontWeight: '600' }}>Notes:</span> {apt.notes || apt.requested_notes}
                        </p>
                      </div>
                    )}

                    {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles['btn--outline-navy']} ${styles['btn--sm']}`}
                          onClick={() => beginReschedule(apt)}
                          disabled={workingAppointmentId === apt.id}
                        >
                          Reschedule
                        </button>
                        <button
                          type="button"
                          className={`${styles.btn} ${styles['btn--sm']}`}
                          style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                          onClick={() => handleCancelAppointment(apt.id)}
                          disabled={workingAppointmentId === apt.id}
                        >
                          {workingAppointmentId === apt.id ? 'Updating...' : 'Cancel'}
                        </button>
                      </div>
                    )}

                    {rescheduleDraft.appointmentId === apt.id && (
                      <div style={{ marginTop: '0.9rem', border: '1px solid #dbeafe', backgroundColor: '#eff6ff', borderRadius: '8px', padding: '0.8rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem', marginBottom: '0.6rem' }}>
                          <input
                            type="datetime-local"
                            value={rescheduleDraft.scheduledAt}
                            onChange={(event) =>
                              setRescheduleDraft((prev) => ({ ...prev, scheduledAt: event.target.value, error: '' }))
                            }
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}
                          />
                          <input
                            type="text"
                            value={rescheduleDraft.notes}
                            placeholder="Reason or note"
                            onChange={(event) =>
                              setRescheduleDraft((prev) => ({ ...prev, notes: event.target.value, error: '' }))
                            }
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}
                          />
                        </div>
                        {rescheduleDraft.error && (
                          <p style={{ color: '#dc2626', marginBottom: '0.4rem' }}>{rescheduleDraft.error}</p>
                        )}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--sm']}`}
                            onClick={() => handleApplyReschedule(apt.id)}
                            disabled={workingAppointmentId === apt.id}
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            className={`${styles.btn} ${styles['btn--outline-navy']} ${styles['btn--sm']}`}
                            onClick={() => setRescheduleDraft({ appointmentId: null, scheduledAt: '', notes: '', error: '' })}
                          >
                            Close
                          </button>
                        </div>
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
