import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import styles from './user_dashboard.module.css';

const Layout = ({ heroLabel, heroTitle, heroDesc, children }) => {
  const [isHeroMinimized, setIsHeroMinimized] = React.useState(() => {
    return localStorage.getItem('heroMinimized') === 'true';
  });

  const toggleHero = () => {
    const newState = !isHeroMinimized;
    setIsHeroMinimized(newState);
    localStorage.setItem('heroMinimized', String(newState));
  };

  return (
    <div className={styles.page}>
      <Header />
      <Sidebar />

      <section className={`${styles.hero} ${isHeroMinimized ? styles['hero--minimized'] : ''}`}>
        <button 
          onClick={toggleHero}
          className={styles.hero__toggle}
          aria-label={isHeroMinimized ? "Expand banner" : "Minimize banner"}
        >
          {isHeroMinimized ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </button>

        <div className={`${styles.hero__content} ${isHeroMinimized ? styles['hero__content--minimized'] : styles['hero__content--visible']}`}>
          <div className={styles['hero__text-wrapper']}>
             {!isHeroMinimized && heroLabel && <div className={styles.hero__label}>{heroLabel}</div>}
             <h2 className={`${styles.hero__title} ${isHeroMinimized ? styles['hero__title--minimized'] : ''}`}>{heroTitle}</h2>
             {!isHeroMinimized && heroDesc && <p className={styles.hero__desc}>{heroDesc}</p>}
          </div>
        </div>
      </section>

      <div className={styles.container}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
