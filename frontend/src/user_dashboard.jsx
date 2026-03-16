import styles from './user_dashboard.module.css';
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { 
  LayoutDashboard, Activity, MessageSquare, 
  Calendar, Info, Heart 
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();

  // Get logged-in user's name from localStorage
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = userData.first_name
    ? `${userData.first_name} ${userData.last_name}`
    : "User";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const summaryData = [
    { title: "2 weeks", sub: "Before follow-up", date: "March 11, 2026", icon: <Calendar size={18}/>, color: "#eef2ff" },
    { title: "3", sub: "Vitals recorded", date: "This February", icon: <Activity size={18}/>, color: "#f0fdf4" },
    { title: "3", sub: "Medical records made", date: "This February", icon: <Activity size={18} color="#f59e0b"/>, color: "#fffbeb" },
    { title: "2 out of 3", sub: "Appointments accomplished", date: "This February", icon: <Activity size={18} color="#ef4444"/>, color: "#fef2f2" },
  ];

  return (
    <div className={styles['page']}>
      {/* NAVBAR */}
      <nav className={styles['navbar']}>
        <div className={styles['navbar__logo']}>
          <div className={styles['navbar__logo-icon']}></div>
          <span>BantayKalusugan</span>
        </div>
        <div className={styles['navbar__menu']}>
          <ul className={`${styles['navbar__links']} ${styles['navbar__links--desktop']}`}>
            <li><Link to="/" className={styles['navbar__link']}>Home</Link></li>
            <li><a href="/#services" className={styles['navbar__link']}>Services</a></li>
            <li><a href="/#about" className={styles['navbar__link']}>About Us</a></li>
          </ul>
          <button type="button" className={`${styles['btn']} ${styles['btn--outline-navy']} ${styles['btn--sm']}`} onClick={handleLogout}>Log Out</button>
        </div>
      </nav>

      {/* SIDEBAR */}
      <aside className={styles['sidebar']}>
        <NavItem icon={<LayoutDashboard />} label="Dashboard" />
        <NavItem icon={<Activity />} label="Analytics" />
        <NavItem icon={<MessageSquare />} label="Chat" />
        <NavItem icon={<Calendar />} label="Schedules" />
        <NavItem icon={<Info />} label="Health Information" />
      </aside>

      {/* TOP STATS BAR
      <div className={styles['hero__stats-bar']}>
        <div className={styles['stats-grid']}>
          {summaryData.map((item, idx) => (
            <div key={idx} className={styles['stat-item']}>
              <span className={styles['stat-item__value']}>{item.title}</span>
              <span className={styles['stat-item__label']}>{item.sub}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* HERO SECTION */}
      <section className={styles['hero']}>
        <div className={`${styles['hero__content']} ${styles['hero__content--visible']}`}>
          <h2 className={styles['hero__title']}>Hello, <span className={styles['hero__title--gold']}>{userName}</span></h2>
          <p className={styles['hero__desc']}>Welcome to your health dashboard</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className={styles['container']}>
        {/* METRICS CARDS */}
        <section className={`${styles['section']} ${styles['section--white']}`}>
          <div className={`${styles['card-grid']} ${styles['card-grid--4']}`}>
            {summaryData.map((item, idx) => (
              <div key={idx} className={styles['card']}>
                <div className={styles['card__icon']} style={{ backgroundColor: item.color }}>
                  {item.icon}
                </div>
                <h3 className={styles['card__title']}>{item.title}</h3>
                <p className={styles['card__desc']}>{item.sub}</p>
                <p className={styles['card__desc']} style={{ fontSize: '0.70rem', marginTop: '4px' }}>{item.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LATEST VITALS */}
        <section className={`${styles['section']} ${styles['section--grey']}`}>
          <div className={styles['subsection-header']}>
            <h3 className={styles['subsection-header__title']}>Latest Vitals</h3>
            <a href="#" className={styles['card-grid__link']}>View all</a>
          </div>
          <div className={`${styles['card-grid']} ${styles['card-grid--3']}`}>
            <div className={styles['card']}>
              <div className={`${styles['card__icon']} ${styles['icon--red']}`} style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                <Heart size={20} fill="currentColor" />
              </div>
              <h4 className={styles['card__title']}>Heading 1</h4>
              <span className={`${styles['badge']} ${styles['badge--red']}`}>Warning</span>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className={styles['card']} style={{ minHeight: '160px' }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label }) => (
  <div className={styles['sidebar__item']}>
    {React.cloneElement(icon, { size: 24 })}
    <span>{label}</span>
  </div>
);

export default UserDashboard;