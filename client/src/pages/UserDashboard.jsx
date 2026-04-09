import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiArrowLeft, HiMagnifyingGlass, HiOutlineRocketLaunch,
  HiOutlineBriefcase, HiOutlineUser, HiOutlineDocumentText,
  HiArrowRightOnRectangle, HiOutlineMapPin, HiOutlineClock,
  HiCog6Tooth, HiBell, HiOutlineBell, // ✅ Notification icons
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from './Dashboard.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function UserDashboard() {
  const { token, userData, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('browse');
  const [requirements, setRequirements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profile, setProfile] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [showApplyModal, setShowApplyModal] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [profileForm, setProfileForm] = useState({});
  const [loading, setLoading] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };
  
  // ✅ DROPDOWN STATES
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ NOTIFICATION STATES
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Unknown';
    const posted = new Date(dateString);
    if (isNaN(posted)) return 'Unknown';

    const now = new Date();
    const diffMs = now - posted;
    if (diffMs < 0) return 'Just now';

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;

    return posted.toLocaleDateString('en-IN');
  };

  const categories = ['All Categories', 'Funding', 'Talent', 'Mentorship', 'Partnership', 'Other'];

  const fetchRequirements = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'All Categories') params.category = category;
      const res = await axios.get(`${API}/requirements`, { params });
      setRequirements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API}/applications/my`, { headers });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API}/users/profile`, { headers });
      setProfile(res.data);
      setProfileForm(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FETCH NOTIFICATIONS
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/notifications`, { headers });
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { 
    fetchRequirements(); 
    fetchNotifications();
  }, [search, category]);

  useEffect(() => { 
    fetchApplications(); 
    fetchProfile(); 
  }, []);

  // ✅ NOTIFICATION FUNCTIONS
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API}/notifications/${notificationId}/read`, {}, { headers });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearNotifications = async () => {
    if (!confirm('Clear all notifications?')) return;
    try {
      await axios.delete(`${API}/notifications/clear`, { headers });
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notifications cleared!');
    } catch (err) {
      toast.error('Failed to clear');
    }
  };

  const toggleSettings = (e) => {
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowProfileMenu(false);
      setShowSettings(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleApply = async (reqId) => {
    setLoading(true);
    try {
      await axios.post(`${API}/applications`, {
        requirement_id: reqId, cover_letter: coverLetter,
      }, { headers });
      toast.success('Application submitted!');
      setShowApplyModal(null);
      setCoverLetter('');
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  const [resumeFile, setResumeFile] = useState(null);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/users/profile`, profileForm, { headers });
      toast.success('Profile updated!');
      fetchProfile();
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      toast.error('Please choose a resume file first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      await axios.post(`${API}/users/profile/resume`, formData, {
        headers: {
          ...headers,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Resume uploaded successfully!');
      setResumeFile(null);
      fetchProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload resume');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
    setShowProfileMenu(false);
    setShowSettings(false);
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').slice(0, 2).map(p => p[0].toUpperCase()).join('');
  };

  const appliedIds = new Set(applications.map(a => a.requirement_id?._id));

  return (
    <div className={styles.dashWrapper}>
      {/* ✅ HEADER WITH NOTIFICATION BELL & PERFECT PROFILE MENU */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.headerBack}><HiArrowLeft size={18} /> Home</Link>
          <div>
            <h1 className={styles.headerTitle}>{userData?.name || 'User'}</h1>
            <p className={styles.headerSub}>User Dashboard</p>
          </div>
        </div>
        
        <div className={styles.headerRight}>
          {/* ✅ NOTIFICATION BELL */}
         <div
  className={styles.notifBell}
  onClick={() => {
    setActiveTab('notifications');
    fetchNotifications();
  }}
  role="button"
  tabIndex={0}
  title="Notifications"
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      setActiveTab("notifications");
      fetchNotifications();
    }
  }}
>
  <HiOutlineBell size={20} />

  {unreadCount > 0 && (
    <span className={styles.notificationBadge}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</div>

          {/* ✅ AVATAR WITH PERFECT NESTED MENU */}
          <div className={styles.avatarWrapper}>
            <div 
              className={styles.avatar} 
              onClick={(e) => {
                e.stopPropagation();
                setShowProfileMenu(!showProfileMenu);
              }}
            >
              {getInitials(userData?.name)}
            </div>

            {showProfileMenu && (
              <div className={styles.profileDropdown} onClick={(e) => e.stopPropagation()}>
                {/* ✅ USER INFO */}
                <div className={styles.profileInfo}>
                  <h4>{userData?.name}</h4>
                  <p>{userData?.email}</p>
                </div>

                <div className={styles.dropdownDivider}></div>
                
                {/* ✅ SETTINGS SECTION - EXACTLY LIKE YOU WANTED */}
                <div className={styles.settingsSection}>
                  <button 
                    className={`${styles.dropdownItem} ${styles.settingsToggle}`} 
                    onClick={toggleSettings}
                  >
                    <HiCog6Tooth size={18} /> Settings
                    <span className={styles.toggleIndicator}>
                      {showSettings ? '▲' : '▼'}
                    </span>
                  </button>
                  
                  {/* ✅ NESTED SETTINGS MENU - NO NOTIFICATIONS HERE */}
                  {showSettings && (
                    <div className={styles.nestedSettings}>
                      <button className={styles.dropdownItem}>Account</button>
                      <button className={styles.dropdownItem}>Notification</button>
                      <button className={styles.dropdownItem}>Privacy & Security</button>
                      <button className={styles.dropdownItem}>Help & Support</button>
                      <button className={styles.dropdownItem}>About</button>
                    </div>
                  )}
                </div>

                <div className={styles.dropdownDivider}></div>
                
                <button
                  onClick={handleLogout}
                  className={styles.logoutBtn}
                >
                  <HiArrowRightOnRectangle size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.dashContent}>
        {/* ✅ TABS WITH NOTIFICATIONS TAB */}
        <div className={styles.userTabsContainer}>
          <div className={styles.userTabsNav}>
            <button
              className={`${styles.userTab} ${
                activeTab === 'browse' ? styles.userTabActive : ''
              }`}
              onClick={() => setActiveTab('browse')}
            >
              <HiOutlineBriefcase size={16} />
              <span>Browse Jobs</span>
            </button>

            <button
              className={`${styles.userTab} ${
                activeTab === 'profile' ? styles.userTabActive : ''
              }`}
              onClick={() => setActiveTab('profile')}
            >
              <HiOutlineUser size={16} />
              <span>My Profile</span>
            </button>

            <button
              className={`${styles.userTab} ${
                activeTab === 'applications' ? styles.userTabActive : ''
              }`}
              onClick={() => setActiveTab('applications')}
            >
              <HiOutlineDocumentText size={16} />
              <span>My Applications</span>
            </button>

            {/* ✅ NOTIFICATIONS TAB - HERE IT IS! */}
            <button
              className={`${styles.userTab} ${
                activeTab === 'notifications' ? styles.userTabActive : ''
              }`}
              onClick={() => { 
                setActiveTab('notifications'); 
                fetchNotifications(); 
              }}
            >
              <HiOutlineBell size={16} />
              <span>Notifications </span>
            </button>
          </div>
        </div>

        {/* ✅ BROWSE JOBS TAB (unchanged) */}
        {activeTab === 'browse' && (
          <>
            <div className={styles.searchBox}>
              <HiMagnifyingGlass size={18} />
              <input 
                type="text" 
                placeholder="Search jobs by category, skills, or company..."
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>

            <div className={styles.categoryBar}>
              {categories.map(cat => (
                <button 
                  key={cat}
                  className={`${styles.catBtn} ${category === cat ? styles.catBtnActive : ''}`}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.cardList}>
              {requirements.length === 0 ? (
                <div className={styles.emptyState}>
                  <HiOutlineBriefcase size={48} />
                  <p>No jobs found matching your criteria</p>
                </div>
              ) : (
                requirements.map(req => (
                  <div key={req._id} className={styles.jobCard}>
                    <div className={styles.jobHeader}>
                      <div>
                        <h3 className={styles.jobCompany}>
                          {req.startup_id?.name || 'Unknown Startup'}
                        </h3>
                        <div className={styles.reqMeta}>
                          <span className={styles.badgeCategory}>{req.category}</span>
                          <span className={`${styles.badge} ${styles[`badge${req.urgency_level}`]}`}>
                            {req.urgency_level} Priority
                          </span>
                        </div>
                      </div>
                      {appliedIds.has(req._id) ? (
                        <span className={styles.appliedBadge}>Applied</span>
                      ) : (
                        <button className={styles.btnApply} onClick={() => setShowApplyModal(req._id)}>
                          Apply Now
                        </button>
                      )}
                    </div>
                    <h4 className={styles.jobTitle}>{req.title}</h4>
                    {req.description && <p className={styles.jobDesc}>{req.description}</p>}
                    <div className={styles.jobFooter}>
                      {req.preferred_skills && (
                        <span className={styles.jobDetail}>
                          <HiOutlineBriefcase size={14} /> Skills: {req.preferred_skills}
                        </span>
                      )}
                      <span className={styles.jobDetail}>
                        <HiOutlineClock size={14} /> Posted: {formatRelativeTime(req.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* ✅ PROFILE TAB (unchanged) */}
        {activeTab === 'profile' && profile && (
          <div className={styles.profileSection}>
            <div className={styles.profileCard}>
              <div className={styles.profileAvatar}>
                <HiOutlineUser size={48} />
              </div>
              <h2>{profile.name}</h2>
              <p className={styles.profileEmail}>{profile.email}</p>

              <form onSubmit={handleProfileUpdate} className={styles.profileForm}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={profileForm.name || ''}
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      value={profileForm.phone_number || ''}
                      onChange={e => setProfileForm({...profileForm, phone_number: e.target.value})} 
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={profileForm.location || ''}
                    onChange={e => setProfileForm({...profileForm, location: e.target.value})} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Skills</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="React, Node.js, Python"
                    value={profileForm.skills || ''}
                    onChange={e => setProfileForm({...profileForm, skills: e.target.value})} 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Bio</label>
                  <textarea 
                    className={styles.textarea} 
                    rows={3} 
                    placeholder="Tell about yourself..."
                    value={profileForm.bio || ''}
                    onChange={e => setProfileForm({...profileForm, bio: e.target.value})} 
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Resume</label>
                  {profile?.resume_url ? (
                    <div>
                      <a href={profile.resume_url} target="_blank" rel="noreferrer" className={styles.link}>
                        View uploaded resume
                      </a>
                    </div>
                  ) : (
                    <p className={styles.smallText}>No resume uploaded yet.</p>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files?.[0] || null)}
                    className={styles.input}
                  />
                  <button
                    type="button"
                    className={styles.btnPost}
                    onClick={handleResumeUpload}
                  >
                    Upload Resume
                  </button>
                </div>

                <button type="submit" className={styles.btnPost}>Save Profile</button>
              </form>
            </div>
          </div>
        )}

        {/* ✅ APPLICATIONS TAB (unchanged) */}
        {activeTab === 'applications' && (
          <div className={styles.cardList}>
            {applications.length === 0 ? (
              <div className={styles.emptyState}>
                <HiOutlineDocumentText size={48} />
                <p>You haven't applied to any jobs yet</p>
                <button className={styles.btnPost} onClick={() => setActiveTab('browse')}>
                  Browse Jobs
                </button>
              </div>
            ) : (
              applications.map(app => (
                <div key={app._id} className={styles.appCard}>
                  <div className={styles.appHeader}>
                    <div>
                      <h3>{app.requirement_id?.startup_id?.name || 'Startup'}</h3>
                      <p className={styles.appSub}>{app.requirement_id?.title || 'Position'}</p>
                    </div>
                    <span className={`${styles.badge} ${styles[`badgeStatus${app.status}`]}`}>
                      {app.status}
                    </span>
                  </div>
                  {app.cover_letter && <p className={styles.appCover}>{app.cover_letter}</p>}
                  <p className={styles.reqDate}>
                    Applied: {new Date(app.applied_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* ✅ NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className={styles.section}>
            <div className={styles.notifHeader}>
              <h2 className={styles.sectionTitle}>Notifications</h2>
              {notifications.length > 0 && (
                <button className={styles.btnClear} onClick={clearNotifications}>
                  Clear All
                </button>
              )}
            </div>
            
            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <HiOutlineBell size={48} />
                <p>No notifications</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  New jobs & application updates will appear here
                </p>
              </div>
            ) : (
              <div className={styles.notifList}>
                {notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`${styles.notifItem} ${!notif.isRead ? styles.notifUnread : ''}`}
                    onClick={() => !notif.isRead && markAsRead(notif._id)}
                  >
                    <div className={styles.notifContent}>
                      <h4>{notif.title}</h4>
                      <p>{notif.message}</p>
                      <span className={styles.notifTime}>
                        {new Date(notif.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <button 
                        className={styles.notifMarkRead} 
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notif._id);
                        }}
                      >
                        ✓
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* APPLY MODAL (unchanged) */}
      {showApplyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApplyModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Apply for this Position</h2>
            <div className={styles.formGroup}>
              <label>Cover Letter (optional)</label>
              <textarea 
                className={styles.textarea} 
                rows={5}
                placeholder="Write why you're a great fit..."
                value={coverLetter} 
                onChange={e => setCoverLetter(e.target.value)} 
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowApplyModal(null)}>
                Cancel
              </button>
              <button 
                className={styles.btnPost} 
                onClick={() => handleApply(showApplyModal)} 
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
