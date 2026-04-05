import React from 'react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

const HelpPage = () => {
  return (
    <Layout
      heroLabel="Help"
      heroTitle={<>Need help?</>}
      heroDesc="Find quick guides on how to use the system and emergency contacts." 
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div className={styles['subsection-header']}>
          <h3 className={styles['subsection-header__title']}>How to use this website</h3>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '16px' }}>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Viewing your dashboard</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>
              Your dashboard shows a quick summary of your recent vitals, appointments, and latest messages. Use the left-hand navigation to move between sections like Analytics, Schedules, and Chat.
            </p>
          </div>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Checking your health history</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>
              Go to the Analytics page to view detailed health records. You can filter by date and vital type to find the readings you need.
            </p>
          </div>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Scheduling appointments</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>
              Visit the Schedules page to see your upcoming appointments and their status. If you need to change an appointment, please contact the clinic directly.
            </p>
          </div>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Need immediate help?</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>
              Call your local health center emergency line right away if you are feeling unwell or need urgent care.
            </p>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles['section--grey']}`}>
        <div className={styles['subsection-header']}>
          <h3 className={styles['subsection-header__title']}>Emergency contacts</h3>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', display: 'grid', gap: '16px' }}>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Local Health Center</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>Phone: <strong>+63 2 1234 5678</strong></p>
            <p style={{ margin: 4, color: '#4b5563' }}>Email: <strong>help@healthcenter.ph</strong></p>
          </div>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Emergency Ambulance</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>Phone: <strong>911 / 9111</strong></p>
          </div>
          <div className={styles.card} style={{ padding: '18px' }}>
            <h4 style={{ margin: '0 0 10px' }}>Mental Health Support</h4>
            <p style={{ margin: 0, color: '#4b5563' }}>Phone: <strong>+63 2 9876 5432</strong></p>
            <p style={{ margin: 4, color: '#4b5563' }}>Email: <strong>support@mentalhealth.ph</strong></p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HelpPage;
