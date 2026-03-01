import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineRocketLaunch, HiArrowLeft } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from './Auth.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function StartupAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [regForm, setRegForm] = useState({
    name: '', founder_name: '', email: '', password: '',
    location: '', domain: '', established_year: '', description: '',
  });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regLoading, setRegLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      const res = await axios.post(`${API}/auth/startup/register`, regForm);
      login(res.data.token, 'startup', res.data.startup);
      toast.success('Startup registered successfully!');
      navigate('/startup/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const res = await axios.post(`${API}/auth/startup/login`, loginForm);
      login(res.data.token, 'startup', res.data.startup);
      toast.success('Startup login successful!');
      navigate('/startup/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authHeader}>
        <Link to="/" className={styles.backLink}>
          <HiArrowLeft size={20} /> Back
        </Link>
        <div className={styles.authBrand}>
          <HiOutlineRocketLaunch size={24} />
          <span>Startup Connect</span>
        </div>
      </div>

      <div className={styles.authRoleLabel}>
        <span className={styles.roleBadge}>Startup Portal</span>
        <p className={styles.roleDesc}>Register your startup or login to manage requirements</p>
      </div>

      <div className={styles.splitContainer}>
        {/* Register Side */}
        <div className={styles.splitPanel}>
          <div className={styles.panelHeader}>
            <h2>Register Startup</h2>
            <p>Create your startup account</p>
          </div>

          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Startup Name *</label>
                <input type="text" className={styles.input} placeholder="Your startup name"
                  value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Founder Name *</label>
                <input type="text" className={styles.input} placeholder="Founder full name"
                  value={regForm.founder_name} onChange={e => setRegForm({...regForm, founder_name: e.target.value})} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Email *</label>
              <input type="email" className={styles.input} placeholder="startup@email.com"
                value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
              <label>Password *</label>
              <input type="password" className={styles.input} placeholder="Create a password"
                value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})} required />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Location *</label>
                <input type="text" className={styles.input} placeholder="City, Country"
                  value={regForm.location} onChange={e => setRegForm({...regForm, location: e.target.value})} required />
              </div>
              <div className={styles.formGroup}>
                <label>Domain *</label>
                <input type="text" className={styles.input} placeholder="e.g. Fintech, EdTech"
                  value={regForm.domain} onChange={e => setRegForm({...regForm, domain: e.target.value})} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Established Year</label>
              <input type="number" className={styles.input} placeholder="2024"
                value={regForm.established_year} onChange={e => setRegForm({...regForm, established_year: e.target.value})} />
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={regLoading}>
              {regLoading ? 'Registering...' : 'Register Startup'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className={styles.divider}>
          <span>OR</span>
        </div>

        {/* Login Side */}
        <div className={styles.splitPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.loginIcon}>
              <HiOutlineRocketLaunch size={36} />
            </div>
            <h2>Welcome Back</h2>
            <p>Login to your startup account</p>
          </div>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" className={styles.input} placeholder="Enter your startup email"
                value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} required />
            </div>

            <div className={styles.formGroup}>
              <label>Password</label>
              <input type="password" className={styles.input} placeholder="Enter your password"
                value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required />
            </div>

            <button type="submit" className={styles.btnSubmit} disabled={loginLoading}>
              {loginLoading ? 'Logging in...' : 'Login as Startup'}
            </button>
          </form>

          <div className={styles.switchRole}>
            <p>Are you a job seeker? <Link to="/user-auth" className={styles.switchLink}>Go to User Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
