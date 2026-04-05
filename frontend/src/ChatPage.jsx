import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ArrowLeft, Send, X } from 'lucide-react';
import Layout from './Layout.jsx';
import styles from './user_dashboard.module.css';

// Mock Data
const initialChatsData = [
  {
    id: 1,
    staffName: 'Dr. Maria Santos',
    facility: 'Makati Health Center',
    lastMessage: 'Got it. I can book you for next Monday morning. Does that work?',
    time: '9:16 AM',
    unread: 2,
    messages: [
      { id: 1, sender: 'Patient', text: 'Hi, I need help scheduling an appointment.', time: '9:12 AM' },
      { id: 2, sender: 'Staff', text: 'Sure! What kind of appointment are you looking for?', time: '9:14 AM' },
      { id: 3, sender: 'Patient', text: 'I need a follow-up for my blood pressure medication.', time: '9:15 AM' },
      { id: 4, sender: 'Staff', text: 'Got it. I can book you for next Monday morning. Does that work?', time: '9:16 AM' }
    ]
  },
  {
    id: 2,
    staffName: 'Nurse Rico Fernandez',
    facility: 'Barangay Clinic',
    lastMessage: 'Please bring your previous lab results tomorrow.',
    time: 'Yesterday',
    unread: 0,
    messages: [
      { id: 1, sender: 'Staff', text: 'Hello, reminding you of your checkup tomorrow at 10 AM.', time: '3:00 PM' },
      { id: 2, sender: 'Patient', text: 'Yes, I will be there. Do I need to bring anything?', time: '3:05 PM' },
      { id: 3, sender: 'Staff', text: 'Please bring your previous lab results tomorrow.', time: '3:10 PM' }
    ]
  },
  {
    id: 3,
    staffName: 'Admin Desk',
    facility: 'Makati Health Center',
    lastMessage: 'Your medical certificate is ready for pickup.',
    time: 'Monday',
    unread: 0,
    messages: [
      { id: 1, sender: 'Patient', text: 'Hi, is my medical certificate ready?', time: '9:00 AM' },
      { id: 2, sender: 'Staff', text: 'Let me check on that for you.', time: '9:30 AM' },
      { id: 3, sender: 'Staff', text: 'Your medical certificate is ready for pickup.', time: '10:15 AM' }
    ]
  }
];

const ChatPage = () => {
  const [chats, setChats] = useState(initialChatsData);
  const [activeChatId, setActiveChatId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal states
  const [newMessageTo, setNewMessageTo] = useState('');
  const [newMessageContent, setNewMessageContent] = useState('');

  // Active chat state
  const [draft, setDraft] = useState('');
  const bottomRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    if (activeChatId) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, chats]);

  const handleSendInActiveChat = () => {
    if (!draft.trim() || !activeChatId) return;
    
    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        const newMessage = {
            id: chat.messages.length + 1,
            sender: 'Patient',
            text: draft.trim(),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return {
          ...chat,
          lastMessage: draft.trim(),
          time: newMessage.time,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    }));
    
    setDraft('');
  };

  const handleCreateNewChat = () => {
    if (!newMessageTo.trim() || !newMessageContent.trim()) return;
    
    const newChatId = chats.length + 1;
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newChat = {
        id: newChatId,
        staffName: newMessageTo.trim(),
        facility: 'Unknown Facility',
        lastMessage: newMessageContent.trim(),
        time: timeNow,
        unread: 0,
        messages: [
            { id: 1, sender: 'Patient', text: newMessageContent.trim(), time: timeNow }
        ]
    };
    
    setChats([newChat, ...chats]);
    setIsModalOpen(false);
    setNewMessageTo('');
    setNewMessageContent('');
    setActiveChatId(newChatId);
  };

  const filteredChats = chats.filter(c => 
    c.staffName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout
      heroLabel="Messages"
      heroTitle={<>Support <span className={styles['hero__title--gold']}>Chat</span></>}
      heroDesc="Connect with your health center staff. Ask questions, request assistance, or follow up on appointments." 
    >
      <section className={`${styles.section} ${styles['section--white']}`}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '650px' }}>
          
          {/* LIST VIEW */}
          {!activeChatId && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Header */}
              <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>Conversations</h3>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className={styles.btn + ' ' + styles['btn--primary']} 
                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    <Plus size={18} /> New Message
                  </button>
                </div>
                
                {/* Search */}
                <div style={{ position: 'relative' }}>
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    type="text" 
                    placeholder="Search messages or staff..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 40px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.95rem',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => { e.target.style.borderColor = '#2563eb'; e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </div>

              {/* Chat List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredChats.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    No messages found matching "{searchQuery}"
                  </div>
                ) : (
                  filteredChats.map((chat) => (
                    <div 
                      key={chat.id}
                      onClick={() => {
                        // Mark as read when opened
                        if (chat.unread > 0) {
                            setChats(chats.map(c => c.id === chat.id ? {...c, unread: 0} : c));
                        }
                        setActiveChatId(chat.id);
                      }}
                      style={{ 
                        padding: '16px 20px', 
                        borderBottom: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        backgroundColor: chat.unread > 0 ? '#f0fdf4' : '#fff'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = chat.unread > 0 ? '#f0fdf4' : '#fff'}
                    >
                      {/* Avatar placeholder */}
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                        {chat.staffName.charAt(0)}
                      </div>
                      
                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: chat.unread > 0 ? '700' : '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {chat.staffName}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: chat.unread > 0 ? '#10b981' : '#64748b', fontWeight: chat.unread > 0 ? '600' : '400', flexShrink: 0, marginLeft: '12px' }}>
                            {chat.time}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: chat.unread > 0 ? '#1e293b' : '#64748b', fontWeight: chat.unread > 0 ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {chat.lastMessage}
                        </p>
                      </div>
                      
                      {/* Unread indicator */}
                      {chat.unread > 0 && (
                        <div style={{ width: '20px', height: '20px', backgroundColor: '#10b981', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', flexShrink: 0 }}>
                          {chat.unread}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* CONVERSATION VIEW */}
          {activeChatId && activeChat && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Active Chat Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', background: '#f8fafc' }}>
                <button 
                  onClick={() => setActiveChatId(null)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', color: '#64748b', transition: 'background-color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <ArrowLeft size={20} />
                </button>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0 }}>
                  {activeChat.staffName.charAt(0)}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: '700' }}>{activeChat.staffName}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{activeChat.facility}</span>
                </div>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      alignSelf: msg.sender === 'Staff' ? 'flex-start' : 'flex-end',
                      maxWidth: '80%'
                    }}
                  >
                    <div
                      style={{
                        background: msg.sender === 'Staff' ? '#f1f5f9' : '#1e40af',
                        color: msg.sender === 'Staff' ? '#0f172a' : '#ffffff',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        borderBottomLeftRadius: msg.sender === 'Staff' ? '4px' : '16px',
                        borderBottomRightRadius: msg.sender !== 'Staff' ? '4px' : '16px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        fontSize: '0.95rem',
                        lineHeight: 1.5,
                      }}
                    >
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: msg.sender === 'Staff' ? 'flex-start' : 'flex-end', padding: '0 4px' }}>
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInActiveChat()}
                  placeholder="Type a message..."
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
                  onClick={handleSendInActiveChat} 
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
          )}
        </div>
      </section>

      {/* NEW CHAT MODAL OVERLAY */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '500px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden', animation: 'fadeIn 0.2s ease-out' }}>
            
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: '700' }}>New Message</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>To:</label>
                <input 
                  type="text" 
                  value={newMessageTo}
                  onChange={(e) => setNewMessageTo(e.target.value)}
                  placeholder="e.g. Dr. Santos or Makati Health Center" 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Message:</label>
                <textarea 
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  placeholder="Type your message here..." 
                  rows={5}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>
            
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: '#f8fafc' }}>
              <button 
                onClick={() => setIsModalOpen(false)}
                className={`${styles.btn} ${styles['btn--outline-navy']}`}
                style={{ padding: '10px 20px', backgroundColor: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateNewChat}
                className={`${styles.btn} ${styles['btn--primary']}`}
                style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', opacity: (!newMessageTo.trim() || !newMessageContent.trim()) ? 0.6 : 1, cursor: (!newMessageTo.trim() || !newMessageContent.trim()) ? 'not-allowed' : 'pointer', backgroundColor: '#1e40af', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600' }}
                disabled={!newMessageTo.trim() || !newMessageContent.trim()}
              >
                <Send size={16} /> Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </Layout>
  );
};

export default ChatPage;
