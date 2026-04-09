import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiMagnifyingGlass, HiPlus,
  HiOutlineBriefcase, HiOutlineUserGroup,
  HiOutlineTrash, HiOutlinePencilSquare,
  HiArrowRightOnRectangle, HiCog6Tooth,
  HiBell, HiOutlineBell
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from './Dashboard.module.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function StartupDashboard() {
  const { token, userData, logout } = useAuth();
  const navigate = useNavigate();

  const [requirements, setRequirements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('All Levels');
  const [location, setLocation] = useState('');
  const [sortBy, setSortBy] = useState('Relevance');
  const [activeTab, setActiveTab] = useState('requirements');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Talent',
    preferred_skills: '',
    urgency_level: 'Medium',
    description: '',
    experience: 'Fresher'
  });
  const [loading, setLoading] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ✅ Notifications state
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

  const fetchData = async () => {
    try {
      const [reqRes, appRes, candRes] = await Promise.all([
        axios.get(`${API}/requirements/my`, { headers, params: { search } }),
        axios.get(`${API}/applications/startup`, { headers }),
        axios
          .get(`${API}/users`, { headers, params: { type: 'job-seeker' } })
          .catch(() => ({ data: [] })),
      ]);
      setRequirements(reqRes.data);
      setApplications(appRes.data);
      setCandidates(candRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Fetch notifications list + unread count
  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API}/notifications`, { headers });
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, activeTab]);

  // Load notifications once on mount (and you can also call on tab click)
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${API}/notifications/${notificationId}/read`,
        {},
        { headers }
      );
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Clear all notifications
  const clearNotifications = async () => {
    try {
      await axios.delete(`${API}/notifications/clear`, { headers });
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notifications cleared!');
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSettings = (e) => {
    e.stopPropagation();
    setShowSettings(!showSettings);
  };

  const handleEdit = (req) => {
    setEditingId(req._id);
    setFormData({
      title: req.title,
      category: req.category,
      preferred_skills: req.preferred_skills || '',
      urgency_level: req.urgency_level || 'Medium',
      description: req.description || '',
      experience: req.experience || 'Fresher',
    });
    setShowModal(true);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API}/requirements/${editingId}`, formData, { headers });
        toast.success('Requirement updated!');
      } else {
        await axios.post(`${API}/requirements`, formData, { headers });
        toast.success('Requirement posted!');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({
        title: '',
        category: 'Talent',
        preferred_skills: '',
        urgency_level: 'Medium',
        description: '',
        experience: 'Fresher',
      });
      fetchData();
    } catch (err) {
      toast.error(
        editingId ? 'Failed to update requirement' : 'Failed to post requirement'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this requirement?')) return;
    try {
      await axios.delete(`${API}/requirements/${id}`, { headers });
      toast.success('Requirement deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleAppStatus = async (appId, status) => {
    try {
      await axios.put(
        `${API}/applications/${appId}/status`,
        { status },
        { headers }
      );
      toast.success(`Application ${status.toLowerCase()}`);
      fetchData();
      // Optional: refetch notifications if backend creates one on status change
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
      setShowSettings(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const activeCount = requirements.filter((r) => r.status === 'Open').length;

  const filteredCandidates = candidates
    .filter((candidate) => {
      const matchSearch =
        candidateSearch === '' ||
        candidate.name
          ?.toLowerCase()
          .includes(candidateSearch.toLowerCase()) ||
        candidate.skills
          ?.toLowerCase()
          .includes(candidateSearch.toLowerCase());
      const matchExperience =
        experienceLevel === 'All Levels' ||
        candidate.experience_level === experienceLevel;
      const matchLocation =
        location === '' ||
        candidate.location?.toLowerCase().includes(location.toLowerCase());
      return matchSearch && matchExperience && matchLocation;
    })
    .sort((a, b) => {
      if (sortBy === 'Relevance') return 0;
      if (sortBy === 'Name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className={styles.dashWrapper}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div>
            <h1 className={styles.headerTitle}>{userData?.name || 'My Startup'}</h1>
            <p className={styles.headerSub}>Startup Dashboard</p>
          </div>
        </div>
        <div className={styles.headerRight}>
          {/*  Notification bell in header */}
       <div
  className={styles.notifBell}
  onClick={() => {
    setActiveTab('notifications');
    fetchNotifications();
  }}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setActiveTab('notifications');
      fetchNotifications();
    }
  }}
>
  <HiOutlineBell size={22} />
  {unreadCount > 0 && (
    <span className={styles.notificationBadge}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</div>


          <div className={styles.avatarWrapper}>
            <div
              className={styles.avatar}
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
            >
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            {showDropdown && (
              <div
                className={styles.dropdown}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={styles.dropdownInfo}>
                  <strong>{userData?.name}</strong>
                  <p>{userData?.email}</p>
                </div>
                <hr />
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
                  {showSettings && (
                    <div className={styles.nestedSettings}>
                      <button className={styles.dropdownItem}>Account</button>
                      <button className={styles.dropdownItem}>Notification</button>
                      <button className={styles.dropdownItem}>
                        Privacy & Security
                      </button>
                      <button className={styles.dropdownItem}>
                        Help & Support
                      </button>
                      <button className={styles.dropdownItem}>About</button>
                    </div>
                  )}
                </div>
                <hr />
                <button
                  onClick={handleLogout}
                  className={styles.dropdownLogout}
                >
                  <HiArrowRightOnRectangle size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className={styles.dashContent}>
        {/* Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsNav}>
            <span
              className={
                activeTab === 'requirements' ? styles.tabActive : styles.tab
              }
              onClick={() => setActiveTab('requirements')}
            >
              Post Requirements
            </span>
            <span
              className={
                activeTab === 'candidates' ? styles.tabActive : styles.tab
              }
              onClick={() => setActiveTab('candidates')}
            >
              Search Candidates
            </span>
            {/* ✅ Notifications tab with badge */}
            <span
              className={`${activeTab === 'notifications' ? styles.tabActive : styles.tab} ${styles.tabWithBadge}`}
              onClick={() => {
                setActiveTab('notifications');
                fetchNotifications();
              }}
            >
              Notifications
              {/* {unreadCount > 0 && (
                <span className={styles.tabNotificationBadge}>
                  {unreadCount}
                </span>
              )} */}
            </span>
          </div>
        </div>

        {/* Stats section */}
        {activeTab === 'requirements' && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Active Postings</span>
                <span className={styles.statValue}>{activeCount}</span>
                <span className={styles.statDesc}>Job requirements posted</span>
              </div>
              <HiOutlineBriefcase size={24} className={styles.statIcon} />
            </div>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Total Applications Received</span>
                <span className={styles.statValue}>{applications.length}</span>
                <span className={styles.statDesc}>Candidates registered</span>
              </div>
              <HiOutlineUserGroup size={24} className={styles.statIcon} />
            </div>
          </div>
        )}

        {/* Toolbar for requirements */}
        {activeTab === 'requirements' && (
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <HiMagnifyingGlass size={18} />
              <input
                type="text"
                placeholder="Search requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className={styles.btnPost}
              onClick={() => {
                setEditingId(null);
                setShowModal(true);
              }}
            >
              <HiPlus size={18} /> Post New Requirement
            </button>
          </div>
        )}

        {/* Filters for candidates */}
        {activeTab === 'candidates' && (
          <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
              <label>Experience Level</label>
              <select
                className={styles.filterSelect}
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option>All Levels</option>
                <option>Fresher</option>
                <option>1-2 Years</option>
                <option>3-5 Years</option>
                <option>5+ Years</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Location</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Enter location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className={styles.filterGroup}>
              <label>Sort By</label>
              <select
                className={styles.filterSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option>Relevance</option>
                <option>Name</option>
              </select>
            </div>
            <div className={styles.filterGroup}>
              <label>Search</label>
              <input
                type="text"
                className={styles.filterInput}
                placeholder="Search candidates..."
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Requirements list */}
        {activeTab === 'requirements' && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Posted Requirements</h2>
              {requirements.length === 0 ? (
                <div className={styles.emptyState}>
                  <HiOutlineBriefcase size={48} />
                  <p>No requirements posted yet</p>
                  <button
                    className={styles.btnPost}
                    onClick={() => {
                      setEditingId(null);
                      setShowModal(true);
                    }}
                  >
                    Post Your First Requirement
                  </button>
                </div>
              ) : (
                <div className={styles.cardList}>
                  {requirements.map((req) => (
                    <div key={req._id} className={styles.reqCard}>
                      <div className={styles.reqHeader}>
                        <h3>{req.title}</h3>
                        <div className={styles.reqActions}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleEdit(req)}
                          >
                            <HiOutlinePencilSquare size={16} title="Edit" />
                          </button>
                          <button
                            className={styles.iconBtn}
                            onClick={() => handleDelete(req._id)}
                          >
                            <HiOutlineTrash size={16} title="Delete" />
                          </button>
                        </div>
                      </div>
                      <div className={styles.reqMeta}>
                        <span className={styles.badgeCategory}>{req.category}</span>
                        <span
                          className={`${styles.badge} ${
                            styles[`badge${req.urgency_level}`]
                          }`}
                        >
                          {req.urgency_level} Priority
                        </span>
                      </div>
                      {req.description && (
                        <p className={styles.reqDesc}>{req.description}</p>
                      )}
                      {req.preferred_skills && (
                        <p className={styles.reqSkills}>
                          <HiOutlineBriefcase size={14} /> Skills:{' '}
                          {req.preferred_skills}
                        </p>
                      )}
                      {req.experience && (
                        <p className={styles.reqExperience}>
                          <strong>Experience :</strong>
                          <span
                            className={`${styles.experienceBadge} ${
                              styles[
                                `experience${req.experience.replace(
                                  /[\s+-]/g,
                                  ''
                                )}`
                              ]
                            }`}
                          >
                            {req.experience}
                          </span>
                        </p>
                      )}
                      <p className={styles.reqDate}>
                        Posted: {formatRelativeTime(req.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {applications.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Applications Received</h2>
                <div className={styles.cardList}>
                  {applications.map((app) => (
                    <div key={app._id} className={styles.appCard}>
                      <div className={styles.appHeader}>
                        <div>
                          <h3>{app.user_id?.name || 'Unknown User'}</h3>
                          <p className={styles.appSub}>{app.user_id?.email}</p>
                        </div>
                        <div className={styles.appHeaderRight}>
                          <span
                            className={`${styles.badge} ${
                              styles[`badgeStatus${app.status}`]
                            }`}
                          >
                            {app.status}
                          </span>
                          {app.user_id?.experience_level && (
                            <span
                              className={`${styles.badge} ${
                                styles[
                                  `badgeExperience${app.user_id.experience_level.replace(
                                    /[\s+-]/g,
                                    ''
                                  )}`
                                ]
                              }`}
                            >
                              {app.user_id.experience_level}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className={styles.appMeta}>
                        Applied for:{' '}
                        <strong>{app.requirement_id?.title}</strong>
                      </p>
                      {app.user_id?.experience_level && (
                        <p className={styles.appExperience}>
                          <strong>Experience:</strong>{' '}
                          {app.user_id.experience_level}
                        </p>
                      )}
                      {app.user_id?.location && (
                        <p className={styles.appLocation}>
                          <strong>Location:</strong> {app.user_id.location}
                        </p>
                      )}
                      {app.user_id?.skills && (
                        <p className={styles.appSkills}>
                          Skills: {app.user_id.skills}
                        </p>
                      )}
                      {app.cover_letter && (
                        <p className={styles.appCover}>{app.cover_letter}</p>
                      )}

                      {app.status === 'Pending' && (
                        <div className={styles.appActions}>
                          {app.user_id?.resume_url && (
                            <a
                              className={styles.btnView}
                              href={app.user_id.resume_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View Resume
                            </a>
                          )}
                          <button
                            className={styles.btnAccept}
                            onClick={() =>
                              handleAppStatus(app._id, 'Accepted')
                            }
                          >
                            Accept
                          </button>
                          <button
                            className={styles.btnReject}
                            onClick={() =>
                              handleAppStatus(app._id, 'Rejected')
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {app.status !== 'Pending' && app.user_id?.resume_url && (
                        <p className={styles.appResume}>
                          <a
                            className={styles.btnView}
                            href={app.user_id.resume_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Resume
                          </a>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Candidates list */}
        {activeTab === 'candidates' && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Candidates</h2>
            {filteredCandidates.length === 0 ? (
              <div className={styles.emptyState}>
                <HiOutlineUserGroup size={48} />
                <p>No candidates found</p>
              </div>
            ) : (
              <div className={styles.cardList}>
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate._id}
                    className={styles.candidateCard}
                  >
                    <div className={styles.candidateHeader}>
                      <div>
                        <h3>{candidate.name}</h3>
                        <p className={styles.candidateEmail}>
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                    {candidate.experience_level && (
                      <p className={styles.candidateMeta}>
                        <strong>Experience:</strong>{' '}
                        {candidate.experience_level}
                      </p>
                    )}
                    {candidate.location && (
                      <p className={styles.candidateMeta}>
                        <strong>Location:</strong> {candidate.location}
                      </p>
                    )}
                    {candidate.skills && (
                      <p className={styles.candidateSkills}>
                        <strong>Skills:</strong> {candidate.skills}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ✅ Notifications tab content */}
        {activeTab === 'notifications' && (
          <div className={styles.section}>
            <div className={styles.notifHeader}>
              <h2 className={styles.sectionTitle}>Notifications</h2>
              {notifications.length > 0 && (
                <button
                  className={styles.btnClear}
                  onClick={clearNotifications}
                >
                  Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <HiBell size={48} />
                <p>No notifications yet</p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  New job applications will appear here
                </p>
              </div>
            ) : (
              <div className={styles.notifList}>
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`${styles.notifItem} ${
                      !notif.isRead ? styles.notifUnread : ''
                    }`}
                  >
                    <div className={styles.notifContent}>
                      <div className={styles.notifTitleRow}>
                        <h4>{notif.title}</h4>
                        {!notif.isRead && <span className={styles.notifBadge}>NEW</span>}
                      </div>
                      <p>{notif.message}</p>
                      <span className={styles.notifTime}>
                        {new Date(notif.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {!notif.isRead && (
                      <button
                        className={styles.notifMarkRead}
                        onClick={() => markAsRead(notif._id)}
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowModal(false)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editingId ? 'Edit Requirement' : 'Post New Requirement'}</h2>
            <form onSubmit={handlePost}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Full Stack Developer"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select
                    className={styles.input}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option>Engineering</option>
                    <option>IT</option>
                    <option>Sales</option>
                    <option>Marketing</option>
                    <option>Product Management</option>
                    <option>Operations</option>
                    <option>Finance</option>
                    <option>Human Resources</option>
                    <option>Business Development</option>
                    <option>Customer Success</option>
                    <option>Design</option>
                    <option>Data & Analytics</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Urgency</label>
                  <select
                    className={styles.input}
                    value={formData.urgency_level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgency_level: e.target.value,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Experience *</label>
                <select
                  className={styles.input}
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  required
                >
                  <option>Fresher</option>
                  <option>1-2 Years</option>
                  <option>3-5 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Preferred Skills</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="React, Node.js, TypeScript"
                  value={formData.preferred_skills}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferred_skills: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  className={styles.textarea}
                  rows={3}
                  placeholder="Describe the requirement..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.btnCancel}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.btnPost}
                  disabled={loading}
                >
                  {loading
                    ? 'Saving...'
                    : editingId
                    ? 'Update Requirement'
                    : 'Post Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
