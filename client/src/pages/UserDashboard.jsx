import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiArrowLeft, HiMagnifyingGlass, HiOutlineRocketLaunch,
  HiOutlineBriefcase, HiOutlineUser, HiOutlineDocumentText,
  HiArrowRightOnRectangle, HiOutlineMapPin, HiOutlineClock,
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

  useEffect(() => { fetchRequirements(); }, [search, category]);
  useEffect(() => { fetchApplications(); fetchProfile(); }, []);

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

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  const appliedIds = new Set(applications.map(a => a.requirement_id?._id));

  return (
    <div className={styles.dashWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.headerBack}><HiArrowLeft size={18} /> Home</Link>
          <div>
            <h1 className={styles.headerTitle}>{userData?.name || 'User'}</h1>
            <p className={styles.headerSub}>User Dashboard</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <HiArrowRightOnRectangle size={18} /> Logout
        </button>
      </header>

      <div className={styles.dashContent}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${activeTab === 'browse' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('browse')}>
            <HiOutlineBriefcase size={16} /> Browse Jobs
          </button>
          <button className={`${styles.tab} ${activeTab === 'profile' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('profile')}>
            <HiOutlineUser size={16} /> My Profile
          </button>
          <button className={`${styles.tab} ${activeTab === 'applications' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('applications')}>
            <HiOutlineDocumentText size={16} /> My Applications
          </button>
        </div>

        {/* Browse Jobs Tab */}
        {activeTab === 'browse' && (
          <>
            <div className={styles.searchBox}>
              <HiMagnifyingGlass size={18} />
              <input type="text" placeholder="Search jobs by category, skills, or company..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className={styles.categoryBar}>
              {categories.map(cat => (
                <button key={cat}
                  className={`${styles.catBtn} ${category === cat ? styles.catBtnActive : ''}`}
                  onClick={() => setCategory(cat)}>
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
                        <HiOutlineClock size={14} /> Posted: {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Profile Tab */}
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
                    <input type="text" className={styles.input} value={profileForm.name || ''}
                      onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input type="text" className={styles.input} value={profileForm.phone_number || ''}
                      onChange={e => setProfileForm({...profileForm, phone_number: e.target.value})} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Location</label>
                  <input type="text" className={styles.input} value={profileForm.location || ''}
                    onChange={e => setProfileForm({...profileForm, location: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Skills</label>
                  <input type="text" className={styles.input} placeholder="React, Node.js, Python"
                    value={profileForm.skills || ''}
                    onChange={e => setProfileForm({...profileForm, skills: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Bio</label>
                  <textarea className={styles.textarea} rows={3} placeholder="Tell about yourself..."
                    value={profileForm.bio || ''}
                    onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                </div>
                <button type="submit" className={styles.btnPost}>Save Profile</button>
              </form>
            </div>
          </div>
        )}

        {/* Applications Tab */}
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
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApplyModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Apply for this Position</h2>
            <div className={styles.formGroup}>
              <label>Cover Letter (optional)</label>
              <textarea className={styles.textarea} rows={5}
                placeholder="Write why you're a great fit..."
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.btnCancel} onClick={() => setShowApplyModal(null)}>Cancel</button>
              <button className={styles.btnPost} onClick={() => handleApply(showApplyModal)} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
