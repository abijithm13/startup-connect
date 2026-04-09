import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiArrowLeft, HiOutlineRocketLaunch, HiEye, HiEyeSlash } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from './Auth.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function UserAuth() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // 🔥 DEFAULT LOGIN MODE
  const [mode, setMode] = useState('login');
  const [showLoginPassword, setShowLoginPassword] = useState(false);  // ✅ Login password
  const [showRegPassword, setShowRegPassword] = useState(false);     // ✅ Register password

  const [regForm, setRegForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    phone_number: '',
    location: '',
    skills: '',
    bio: '',
  });

  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
  });

  const [regLoading, setRegLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // ================= REGISTER =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);

    try {
      const res = await axios.post(`${API}/auth/user/register`, regForm);
      login(res.data.token, 'user', res.data.user);
      toast.success('Account created successfully!');
      navigate('/user/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setRegLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const res = await axios.post(`${API}/auth/user/login`, loginForm);
      login(res.data.token, 'user', res.data.user);
      toast.success('User login successful!');
      navigate('/user/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className={styles.authWrapper}>
      {/* HEADER */}
      <div className={styles.authHeader}>
        <Link to="/" className={styles.backLink}>
          <HiArrowLeft size={20} /> Back
        </Link>

        <div className={styles.authBrand}>
          <HiOutlineRocketLaunch size={24} />
          <span>Startup Connect</span>
        </div>
      </div>

      {/* ROLE LABEL */}
      <div className={styles.authRoleLabel}>
        <span className={`${styles.roleBadge} ${styles.roleBadgeUser}`}>
          Job Seeker Portal
        </span>
        <p className={styles.roleDesc}>
          Create your profile or login to find opportunities
        </p>
      </div>

      <div className={styles.singleContainer}>
        {/* ================= LOGIN MODE FIRST ================= */}
        {mode === 'login' ? (
          <>
            <div className={styles.panelHeader}>
              <div className={`${styles.loginIcon} ${styles.loginIconUser}`}>
                <HiOutlineUser size={36} />
              </div>
              <h2>Welcome Back</h2>
              <p>Login to access your account</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({
                      ...loginForm,
                      username: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* ✅ LOGIN PASSWORD WITH EYE */}
              <div className={styles.formGroup}>
                <label>Password</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({
                        ...loginForm,
                        password: e.target.value,
                      })
                    }
                    required
                  />
                  <span
                    className={styles.passwordIcon}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                  >
                    {showLoginPassword ? <HiEyeSlash size={20}/> : <HiEye size={20}/>}
                  </span>
                </div>
              </div>

              <div className={styles.forgotPassword}>
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className={`${styles.btnSubmit} ${styles.btnUser}`}
                disabled={loginLoading}
              >
                {loginLoading ? 'Logging in...' : 'Login as User'}
              </button>
            </form>

            <div className={styles.switchRole}>
              <p>
                New user?{' '}
                <span
                  className={styles.switchLink}
                  onClick={() => setMode('register')}
                >
                  Create Account
                </span>
              </p>
            </div>
          </>
        ) : (
          /* ================= REGISTER MODE ================= */
          <>
            <div className={styles.panelHeader}>
              <h2>Create Account</h2>
              <p>Sign up to browse and apply for jobs</p>
            </div>

            <form onSubmit={handleRegister} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Your full name"
                    value={regForm.name}
                    onChange={(e) =>
                      setRegForm({ ...regForm, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Username *</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Choose a username"
                    value={regForm.username}
                    onChange={(e) =>
                      setRegForm({ ...regForm, username: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="your@email.com"
                  value={regForm.email}
                  onChange={(e) =>
                    setRegForm({ ...regForm, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* ✅ REGISTER PASSWORD WITH EYE */}
              <div className={styles.formGroup}>
                <label>Password *</label>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showRegPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="Create a password"
                    value={regForm.password}
                    onChange={(e) =>
                      setRegForm({ ...regForm, password: e.target.value })
                    }
                    required
                  />
                  <span
                    className={styles.passwordIcon}
                    onClick={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? <HiEyeSlash size={20}/> : <HiEye size={20}/>}
                  </span>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="+91 XXXXX XXXXX"
                    value={regForm.phone_number}
                    onChange={(e) =>
                      setRegForm({
                        ...regForm,
                        phone_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="City, Country"
                    value={regForm.location}
                    onChange={(e) =>
                      setRegForm({ ...regForm, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Skills</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. React, Node.js, Python"
                  value={regForm.skills}
                  onChange={(e) =>
                    setRegForm({ ...regForm, skills: e.target.value })
                  }
                />
              </div>

              <button
                type="submit"
                className={`${styles.btnSubmit} ${styles.btnUser}`}
                disabled={regLoading}
              >
                {regLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className={styles.switchRole}>
              <p>
                Already have an account?{' '}
                <span
                  className={styles.switchLink}
                  onClick={() => setMode('login')}
                >
                  Login here
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
