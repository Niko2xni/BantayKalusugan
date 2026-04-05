import React, { useState } from 'react';
import Layout from './Layout.jsx';
import { User, Mail, Lock, Phone, MapPin, Calendar as CalendarIcon, Shield, Edit2 } from 'lucide-react';
import styles from './user_dashboard.module.css';

const ProfilePage = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [address, setAddress] = useState(user.address || '');
  
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Read-only info
  const firstName = user.first_name || '';
  const lastName = user.last_name || '';
  const dob = user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "Not provided";

  return (
    <Layout
      heroLabel="Profile"
      heroTitle={<>Your <span className={styles['hero__title--gold']}>Profile</span></>}
      heroDesc="Manage your account and personal details."
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Account Details Section */}
        <section className={styles.card} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
            <Shield size={20} color="#2E5895" />
            <h3 style={{ fontSize: '1.2rem', color: '#1f2937', margin: 0 }}>Account Details</h3>
          </div>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Email Field */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                <Mail size={16} /> Email Address
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingEmail ? (
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                    autoFocus
                  />
                ) : (
                  <div style={{ flex: 1, fontSize: '1rem', color: '#333' }}>{email}</div>
                )}
                <button 
                  onClick={() => setIsEditingEmail(!isEditingEmail)} 
                  className={`${styles.btn} ${styles['btn--sm']}`} 
                  style={{ backgroundColor: isEditingEmail ? '#1e3a8a' : '#f3f4f6', color: isEditingEmail ? '#fff' : '#4b5563' }}
                >
                  {isEditingEmail ? 'Save' : 'Change Email'}
                </button>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                <Lock size={16} /> Password
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, fontSize: '1rem', color: '#333', letterSpacing: '2px' }}>••••••••</div>
                <button className={`${styles.btn} ${styles['btn--outline-navy']} ${styles['btn--sm']}`}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Details Section */}
        <section className={styles.card} style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>
            <User size={20} color="#2E5895" />
            <h3 style={{ fontSize: '1.2rem', color: '#1f2937', margin: 0 }}>Personal Details</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* First Name (Read-only) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>First Name</label>
              <div style={{ padding: '10px 14px', backgroundColor: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#4b5563', fontSize: '0.95rem', cursor: 'not-allowed' }}>
                {firstName}
              </div>
            </div>

            {/* Last Name (Read-only) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>Last Name</label>
              <div style={{ padding: '10px 14px', backgroundColor: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#4b5563', fontSize: '0.95rem', cursor: 'not-allowed' }}>
                {lastName}
              </div>
            </div>

            {/* Date of Birth (Read-only) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '4px', fontWeight: '600' }}>
                <CalendarIcon size={16} /> Date of Birth
              </label>
              <div style={{ padding: '10px 14px', backgroundColor: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#4b5563', fontSize: '0.95rem', cursor: 'not-allowed' }}>
                {dob}
              </div>
            </div>

            {/* Phone Number (Editable) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                <Phone size={16} /> Phone Number
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {isEditingPhone ? (
                  <input 
                    type="text" 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' }}
                    autoFocus
                  />
                ) : (
                  <div style={{ flex: 1, padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#333', fontSize: '0.95rem' }}>
                    {phone}
                  </div>
                )}
                <button 
                  onClick={() => setIsEditingPhone(!isEditingPhone)} 
                  className={`${styles.btn} ${styles['btn--sm']}`} 
                  style={{ backgroundColor: isEditingPhone ? '#1e3a8a' : '#f3f4f6', color: isEditingPhone ? '#fff' : '#4b5563', width: '100px', justifyContent: 'center' }}
                >
                  {isEditingPhone ? 'Save' : <><Edit2 size={14}/> Edit</>}
                </button>
              </div>
            </div>

            {/* Address (Editable) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px', fontWeight: '600' }}>
                <MapPin size={16} /> Address
              </label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {isEditingAddress ? (
                  <textarea 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                    autoFocus
                  />
                ) : (
                  <div style={{ flex: 1, padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#333', fontSize: '0.95rem', minHeight: '80px' }}>
                    {address}
                  </div>
                )}
                <button 
                  onClick={() => setIsEditingAddress(!isEditingAddress)} 
                  className={`${styles.btn} ${styles['btn--sm']}`} 
                  style={{ backgroundColor: isEditingAddress ? '#1e3a8a' : '#f3f4f6', color: isEditingAddress ? '#fff' : '#4b5563', width: '100px', justifyContent: 'center' }}
                >
                  {isEditingAddress ? 'Save' : <><Edit2 size={14}/> Edit</>}
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>
    </Layout>
  );
};

export default ProfilePage;
