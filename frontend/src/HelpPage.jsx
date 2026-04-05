import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './user_dashboard.module.css';

const AccordionItem = ({ title, subtitle, content }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.card} style={{ padding: '0', overflow: 'hidden', marginBottom: '16px', border: isOpen ? '1px solid var(--navy)' : '1px solid rgba(0, 0, 0, 0.04)', transition: 'all 0.2s ease', position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          width: '100%', 
          padding: '20px 24px', 
          background: isOpen ? 'rgba(46, 88, 149, 0.03)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.2s ease'
        }}
      >
        <div>
          <h4 style={{ margin: '0', fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: '700' }}>{title}</h4>
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--navy)', fontWeight: '600' }}>Best for: <span style={{color: 'var(--text-mid)', fontWeight: '400'}}>{subtitle}</span></p>
        </div>
        <div style={{ color: isOpen ? 'var(--navy)' : 'var(--text-mute)', background: isOpen ? 'rgba(46, 88, 149, 0.1)' : 'rgba(0,0,0,0.04)', borderRadius: '50%', padding: '6px', display: 'flex' }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      {isOpen && (
        <div style={{ borderTop: '1px solid rgba(0, 0, 0, 0.04)', background: 'var(--white)' }}>
          <div style={{ padding: '20px 24px', margin: 0, color: '#4b5563', fontSize: '0.95rem', lineHeight: '1.6' }}>
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

const HelpPage = () => {
  const linkStyle = { color: 'var(--navy)', fontWeight: '600' };
  
  const faqItems = [
    {
      title: "Getting Started",
      subtitle: "New users logging in for the first time.",
      content: <>Welcome to BantayKalusugan! Your dashboard shows a quick summary of your recent vitals, appointments, and latest messages. Use the left-hand navigation to move between sections like <Link to="/analytics" style={linkStyle}>Analytics</Link>, <Link to="/schedules" style={linkStyle}>Schedules</Link>, and <Link to="/chat" style={linkStyle}>Chat</Link>.</>
    },
    {
      title: "Vital Signs 101",
      subtitle: "Understanding the numbers and graphs on the screen.",
      content: <>Go to the <Link to="/analytics" style={linkStyle}>Analytics page</Link> to view detailed health records. You can filter by date and vital type to find the readings you need. Each graph represents your vital history over time.</>
    },
    {
      title: "Schedules",
      subtitle: "Finding out when your next health check is.",
      content: <>Visit the <Link to="/schedules" style={linkStyle}>Schedules page</Link> to see your upcoming appointments and their status. If you need to change an appointment, please contact the clinic directly.</>
    },
    {
      title: "Account Settings",
      subtitle: "Changing passwords or notification preferences.",
      content: <>You can update your personal information or notification preferences by visiting the <Link to="/profile" style={linkStyle}>Profile setting</Link> from the top right hand menu.</>
    }
  ];

  return (
    <Layout
      heroLabel="Help"
      heroTitle={<>Need help?</>}
      heroDesc="Find quick guides on how to use the system." 
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div className={styles['subsection-header']} style={{ maxWidth: '1200px', margin: '0 auto 24px' }}>
          <h3 className={styles['subsection-header__title']}>How to use this website</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start', maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            {faqItems.slice(0, 2).map((item, index) => (
               <AccordionItem key={index} title={item.title} subtitle={item.subtitle} content={item.content} />
            ))}
          </div>
          <div>
            {faqItems.slice(2, 4).map((item, index) => (
               <AccordionItem key={index + 2} title={item.title} subtitle={item.subtitle} content={item.content} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HelpPage;
