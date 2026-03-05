import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './user_dashboard.css';
import { 
  LayoutDashboard, Activity, MessageSquare, 
  Calendar, Info, Heart 
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const summaryData = [
    { title: "2 weeks", sub: "Before follow-up", date: "March 11, 2026", icon: <Calendar size={18}/>, color: "#eef2ff" },
    { title: "3", sub: "Vitals recorded", date: "This February", icon: <Activity size={18}/>, color: "#f0fdf4" },
    { title: "3", sub: "Medical records made", date: "This February", icon: <Activity size={18} color="#f59e0b"/>, color: "#fffbeb" },
    { title: "2 out of 3", sub: "Appointments accomplished", date: "This February", icon: <Activity size={18} color="#ef4444"/>, color: "#fef2f2" },
  ];

  return (
    <div className="page">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar__logo">
          <div className="navbar__logo-icon"></div>
          <span>BantayKalusugan</span>
        </div>
        <div className="navbar__menu">
          <ul className="navbar__links navbar__links--desktop">
            <li><Link to="/" className="navbar__link">Home</Link></li>
            <li><a href="/#services" className="navbar__link">Services</a></li>
            <li><a href="/#about" className="navbar__link">About Us</a></li>
          </ul>
          <button type="button" className="btn btn--outline-navy btn--sm" onClick={() => navigate('/login')}>Log Out</button>
        </div>
      </nav>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <NavItem icon={<LayoutDashboard />} label="Dashboard" />
        <NavItem icon={<Activity />} label="Analytics" />
        <NavItem icon={<MessageSquare />} label="Chat" />
        <NavItem icon={<Calendar />} label="Schedules" />
        <NavItem icon={<Info />} label="Health Information" />
      </aside>

      {/* TOP STATS BAR
      <div className="hero__stats-bar">
        <div className="stats-grid">
          {summaryData.map((item, idx) => (
            <div key={idx} className="stat-item">
              <span className="stat-item__value">{item.title}</span>
              <span className="stat-item__label">{item.sub}</span>
            </div>
          ))}
        </div>
      </div> */}

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero__content hero__content--visible">
          <h2 className="hero__title">Hello, <span className="hero__title--gold">Full Name</span></h2>
          <p className="hero__desc">Lorem ipsum dolor sit amet</p>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="container">
        {/* METRICS CARDS */}
        <section className="section section--white">
          <div className="card-grid card-grid--4">
            {summaryData.map((item, idx) => (
              <div key={idx} className="card">
                <div className="card__icon" style={{ backgroundColor: item.color }}>
                  {item.icon}
                </div>
                <h3 className="card__title">{item.title}</h3>
                <p className="card__desc">{item.sub}</p>
                <p className="card__desc" style={{ fontSize: '0.70rem', marginTop: '4px' }}>{item.date}</p>
              </div>
            ))}
          </div>
        </section>

        {/* LATEST VITALS */}
        <section className="section section--grey">
          <div className="subsection-header">
            <h3 className="subsection-header__title">Latest Vitals</h3>
            <a href="#" className="card-grid__link">View all</a>
          </div>
          <div className="card-grid card-grid--3">
            <div className="card">
              <div className="card__icon icon--red" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                <Heart size={20} fill="currentColor" />
              </div>
              <h4 className="card__title">Heading 1</h4>
              <span className="badge badge--red">Warning</span>
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card" style={{ minHeight: '160px' }} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label }) => (
  <div className="sidebar__item">
    {React.cloneElement(icon, { size: 24 })}
    <span>{label}</span>
  </div>
);

export default UserDashboard;