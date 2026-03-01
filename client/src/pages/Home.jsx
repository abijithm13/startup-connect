import { Link } from 'react-router-dom';
import { HiOutlineRocketLaunch, HiOutlineUserGroup, HiOutlineChartBarSquare, HiOutlineBriefcase } from 'react-icons/hi2';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className={styles.wrapper}>
      {/* Navbar */}
      <nav className={styles.navbar}>
        <div className={styles.logo}>
          <HiOutlineRocketLaunch size={28} />
          <span>Startup Connect</span>
        </div>
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
        <p>&copy; 2024 Startup Connect. All rights reserved.</p>
      </footer>
    </div>
  );
}
