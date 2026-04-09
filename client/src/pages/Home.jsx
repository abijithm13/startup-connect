import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineRocketLaunch, HiOutlineUserGroup, HiOutlineChartBarSquare, HiOutlineBriefcase, HiMoon, HiSun } from 'react-icons/hi2';
import styles from './Home.module.css';

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  return (
    <div className={`${styles.wrapper} ${isDarkMode ? styles.dark : ''}`}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <HiOutlineRocketLaunch size={28} />
          <span>Startup Connect</span>
        </div>
       <button className={styles.themeToggle} onClick={toggleDarkMode} aria-label="Toggle dark mode">
  {isDarkMode ? (
    // 🌞 SUN SVG (Light mode icon)
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="theme-icon"
    >
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M12 2v2"></path>
      <path d="M12 20v2"></path>
      <path d="m4.93 4.93 1.41 1.41"></path>
      <path d="m17.66 17.66 1.41 1.41"></path>
      <path d="M2 12h2"></path>
      <path d="M20 12h2"></path>
      <path d="m6.34 17.66-1.41 1.41"></path>
      <path d="m19.07 4.93-1.41 1.41"></path>
    </svg>
  ) : (
    // 🌙 MOON SVG (Dark mode icon)
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className="theme-icon"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
  )}
</button>

      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>Startup Connect</h1>
        <p className={styles.heroSubtitle}>
          Empowering startups in underrepresented areas by connecting them with
          resources, opportunities, and support they need to thrive.
        </p>

        <div className={styles.heroCta}>
          <Link to="/startup-auth" className={styles.btnPrimary}>
            <HiOutlineBriefcase size={20} />
            I'm a Startup
          </Link>
          <Link to="/user-auth" className={styles.btnOutline}>
            <HiOutlineUserGroup size={20} />
            I'm a Job Seeker
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.iconTeal}`}>
            <HiOutlineRocketLaunch size={32} />
          </div>
          <h3>Easy Registration</h3>
          <p>Quick and simple startup registration process</p>
        </div>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.iconPink}`}>
            <HiOutlineUserGroup size={32} />
          </div>
          <h3>Field Agent Support</h3>
          <p>Offline data collection for remote areas</p>
        </div>
        <div className={styles.featureCard}>
          <div className={`${styles.featureIcon} ${styles.iconPurple}`}>
            <HiOutlineChartBarSquare size={32} />
          </div>
          <h3>Analytics Dashboard</h3>
          <p>Comprehensive insights and reporting</p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; 2026 Startup Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}
