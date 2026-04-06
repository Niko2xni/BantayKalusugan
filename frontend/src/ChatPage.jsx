import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';
import { fetchChatMessages, sendChatMessage } from './utils/patientPortalApi';
import { notifyNotificationsRefresh } from './utils/notificationSync';


function formatTime(isoTimestamp) {
  const parsed = new Date(isoTimestamp);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);


  const loadMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const items = await fetchChatMessages('support');
      setMessages(Array.isArray(items) ? items : []);
    } catch (loadIssue) {
      setError(loadIssue instanceof Error ? loadIssue.message : 'Unable to load chat messages.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (textOverride = null) => {
    const messageText = (textOverride ?? draft).trim();
    if (!messageText || sending) {
      return;
    }

    setSending(true);
    setError('');
    try {
      const posted = await sendChatMessage({
        message: messageText,
        channel: 'support',
      });

      setMessages((prev) => [...prev, ...posted]);
      notifyNotificationsRefresh('chat-message-sent');
      if (textOverride === null) {
        setDraft('');
      }
    } catch (sendIssue) {
      setError(sendIssue instanceof Error ? sendIssue.message : 'Unable to send message.');
    } finally {
      setSending(false);
    }
  };


  const handleEscalate = async () => {
    await handleSend('Please escalate this concern to a health staff member.');
  };

  return (
    <Layout
      heroLabel="Support Assistant"
      heroTitle={<>Bantay Kalusugan <span className={styles['hero__title--gold']}>Assistant</span></>}
      heroDesc="Ask about appointment schedules, confirmation status, rescheduling, and cancellation concerns."
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '650px' }}>

          {/* Bot Chat Header */}
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
              BK
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a', fontWeight: '700' }}>Bantay Kalusugan Assistant</h4>
              <span style={{ fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                Online
              </span>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fdfdfd', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading && (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading conversation...</div>
            )}

            {!loading && !messages.length && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  maxWidth: '80%',
                  background: '#f1f5f9',
                  color: '#0f172a',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  borderBottomLeftRadius: '4px',
                }}
              >
                Hello! I am your Bantay Kalusugan Support Assistant. Ask about your schedule, confirmation status, or appointment updates.
              </div>
            )}

            {messages.map((msg) => {
              const isPatient = msg.sender_type === 'patient';
              return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignSelf: isPatient ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div
                  style={{
                    background: isPatient ? '#1e40af' : '#f1f5f9',
                    color: isPatient ? '#ffffff' : '#0f172a',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderBottomLeftRadius: isPatient ? '16px' : '4px',
                    borderBottomRightRadius: isPatient ? '4px' : '16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.message}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: isPatient ? 'flex-end' : 'flex-start', padding: '0 4px' }}>
                  {formatTime(msg.created_at)}
                </span>
              </div>
              );
            })}

            {error && <div style={{ color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleEscalate}
              className={`${styles.btn} ${styles['btn--outline-navy']} ${styles['btn--sm']}`}
              disabled={sending}
            >
              Escalate
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(null)}
              placeholder="Type your inquiry here..."
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: '999px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#2563eb'}
              onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
            />
            <button
              type="button"
              onClick={() => handleSend(null)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: draft.trim() && !sending ? '#1e40af' : '#94a3b8',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: draft.trim() && !sending ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
              disabled={!draft.trim() || sending}
            >
              <Send size={20} style={{ marginLeft: '2px' }} />
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChatPage;
