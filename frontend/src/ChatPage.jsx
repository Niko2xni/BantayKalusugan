import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { 
        id: 1, 
        sender: 'Bot', 
        text: 'Hello! I am your Bantay Kalusugan Support Assistant. How can I help you today?', 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = (message) => {
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('appointment') || lowerMsg.includes('schedule')) {
      return "To schedule an appointment, please check the dashboard or your profile page for the scheduling tool, or inform me of your preferred health center and date.";
    }
    if (lowerMsg.includes('medical certificate') || lowerMsg.includes('med cert')) {
      return "Medical certificates are usually ready 2-3 working days after your consultation. Do you have a specific request ID or reference number?";
    }
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
      return "Hi there! How can I assist you with your healthcare needs today?";
    }
    if (lowerMsg.includes('thank')) {
      return "You're welcome! Feel free to ask if you have any other questions.";
    }
    return "I'm sorry, I didn't quite catch that. Could you please rephrase or ask about appointments, medical certificates, or general inquiries?";
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    
    // User message
    const userMsg = {
        id: messages.length + 1,
        sender: 'Patient',
        text: draft.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMsg]);
    setDraft('');
    
    // Bot response after 1 second
    setTimeout(() => {
        const botMsg = {
            id: messages.length + 2,
            sender: 'Bot',
            text: getBotResponse(userMsg.text),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <Layout
      heroLabel="Support Assistant"
      heroTitle={<>Bantay Kalusugan <span className={styles['hero__title--gold']}>Assistant</span></>}
      heroDesc="Ask our automated assistant any general inquiries regarding our services, appointments, and facilities." 
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
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  alignSelf: msg.sender === 'Bot' ? 'flex-start' : 'flex-end',
                  maxWidth: '80%'
                }}
              >
                <div
                  style={{
                    background: msg.sender === 'Bot' ? '#f1f5f9' : '#1e40af',
                    color: msg.sender === 'Bot' ? '#0f172a' : '#ffffff',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    borderBottomLeftRadius: msg.sender === 'Bot' ? '4px' : '16px',
                    borderBottomRightRadius: msg.sender !== 'Bot' ? '4px' : '16px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                  }}
                >
                  {msg.text}
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: msg.sender === 'Bot' ? 'flex-start' : 'flex-end', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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
              onClick={handleSend} 
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: draft.trim() ? '#1e40af' : '#94a3b8',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: draft.trim() ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s'
              }}
            >
              <Send size={20} style={{ marginLeft: '2px' }}/>
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ChatPage;
