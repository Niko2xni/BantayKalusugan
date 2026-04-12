import React, { useEffect, useMemo, useState } from 'react';
import Layout from './Layout.jsx';
import { ChevronDown, ChevronUp } from 'lucide-react';
import styles from './user_dashboard.module.css';
import { fetchHelpArticles } from './utils/patientPortalApi';


const fallbackFaqItems = [
  {
    id: 'fallback-getting-started',
    title: 'Getting Started',
    subtitle: 'Using your dashboard and pages.',
    content:
      'Use Dashboard for quick health summary, Analytics for trends, Schedules for appointments, and Chat for support.',
  },
  {
    id: 'fallback-vitals',
    title: 'Vitals and Analytics',
    subtitle: 'Understanding health records.',
    content:
      'Use date filters to review your records and export data from Analytics when needed.',
  },
  {
    id: 'fallback-appointments',
    title: 'Appointments',
    subtitle: 'Requesting and managing schedules.',
    content:
      'Use Schedules to request appointments and track pending, confirmed, completed, or cancelled status changes.',
  },
  {
    id: 'fallback-account',
    title: 'Account and Security',
    subtitle: 'Updating profile and password.',
    content:
      'Use Profile to update contact details and manage your password securely.',
  },
];


const AccordionItem = ({ title, subtitle, content, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

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
          <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: 'var(--navy)', fontWeight: '600' }}>Best for: <span style={{ color: 'var(--text-mid)', fontWeight: '400' }}>{subtitle}</span></p>
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
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    const loadHelpArticles = async () => {
      setLoading(true);
      setError('');
      try {
        const items = await fetchHelpArticles();
        setFaqItems(items.length ? items : fallbackFaqItems);
      } catch (loadIssue) {
        setFaqItems(fallbackFaqItems);
        setError(loadIssue instanceof Error ? loadIssue.message : 'Unable to load help content.');
      } finally {
        setLoading(false);
      }
    };

    loadHelpArticles();
  }, []);


  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return faqItems;
    }

    const keyword = searchTerm.toLowerCase();
    return faqItems.filter((item) => {
      const title = String(item.title || '').toLowerCase();
      const subtitle = String(item.subtitle || '').toLowerCase();
      const content = String(item.content || '').toLowerCase();
      return title.includes(keyword) || subtitle.includes(keyword) || content.includes(keyword);
    });
  }, [faqItems, searchTerm]);

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

        <div style={{ maxWidth: '1200px', margin: '0 auto 16px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search help articles"
            style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
          />
          {error && <p style={{ marginTop: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>{error}</p>}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', alignItems: 'start', maxWidth: '1200px', margin: '0 auto' }}>
          {loading && (
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#64748b' }}>Loading help content...</p>
            </div>
          )}

          {!loading && !filteredItems.length && (
            <div className={styles.card} style={{ gridColumn: '1 / -1' }}>
              <p style={{ color: '#64748b' }}>No help articles match your search.</p>
            </div>
          )}

          {!loading && filteredItems.map((item, index) => (
            <AccordionItem
              key={item.id || item.title || index}
              title={item.title}
              subtitle={item.subtitle}
              content={item.content}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default HelpPage;
