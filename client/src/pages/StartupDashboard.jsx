import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiArrowLeft, HiMagnifyingGlass, HiPlus, HiOutlineRocketLaunch,
  HiOutlineBriefcase, HiOutlineUserGroup, HiOutlineChartBar,
  HiOutlineTrash, HiOutlinePencilSquare, HiArrowRightOnRectangle,
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
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', category: 'Talent', preferred_skills: '',
    urgency_level: 'Medium', description: '',
  });
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [reqRes, appRes] = await Promise.all([
        axios.get(`${API}/requirements/my`, { headers, params: { search } }),
        axios.get(`${API}/applications/startup`, { headers }),
      ]);
      setRequirements(reqRes.data);
      setApplications(appRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, [search]);

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/requirements`, formData, { headers });
      toast.success('Requirement posted!');
      setShowModal(false);
      setFormData({ title: '', category: 'Talent', preferred_skills: '', urgency_level: 'Medium', description: '' });
      fetchData();
    } catch (err) {
      toast.error('Failed to post requirement');
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
      await axios.put(`${API}/applications/${appId}/status`, { status }, { headers });
      toast.success(`Application ${status.toLowerCase()}`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out');
  };

  const activeCount = requirements.filter(r => r.status === 'Open').length;

  return (
    <div className={styles.dashWrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className={styles.headerBack}><HiArrowLeft size={18} /> Home</Link>
          <div>
            <h1 className={styles.headerTitle}>{userData?.name || 'My Startup'}</h1>
            <p className={styles.headerSub}>Startup Dashboard</p>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <HiArrowRightOnRectangle size={18} /> Logout
        </button>
      </header>

      <div className={styles.dashContent}>
        {/* Stats */}
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
              <span className={styles.statLabel}>Total Applications</span>
              <span className={styles.statValue}>{applications.length}</span>
              <span className={styles.statDesc}>Candidates registered</span>
            </div>
            <HiOutlineUserGroup size={24} className={styles.statIcon} />
          </div>
          <div className={styles.statCard}>
            <div className={styles.statInfo}>
              <span className={styles.statLabel}>Avg. per Post</span>
              <span className={styles.statValue}>
                {requirements.length ? Math.round(applications.length / requirements.length) : 0}
              </span>
              <span className={styles.statDesc}>Applications per requirement</span>
            </div>
            <HiOutlineChartBar size={24} className={styles.statIcon} />
          </div>
        </div>

        {/* Search + Post */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <HiMagnifyingGlass size={18} />
            <input type="text" placeholder="Search requirements..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <button className={styles.btnPost} onClick={() => setShowModal(true)}>
            <HiPlus size={18} /> Post New Requirement
          </button>
        </div>

        {/* Requirements List */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Posted Requirements</h2>

          {requirements.length === 0 ? (
            <div className={styles.emptyState}>
              <HiOutlineBriefcase size={48} />
              <p>No requirements posted yet</p>
              <button className={styles.btnPost} onClick={() => setShowModal(true)}>
                Post Your First Requirement
              </button>
            </div>
          ) : (
            <div className={styles.cardList}>
              {requirements.map(req => (
                <div key={req._id} className={styles.reqCard}>
                  <div className={styles.reqHeader}>
                    <h3>{req.title}</h3>
                    <div className={styles.reqActions}>
                      <button className={styles.iconBtn} onClick={() => handleDelete(req._id)}>
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.reqMeta}>
                    <span className={styles.badgeCategory}>{req.category}</span>
                    <span className={`${styles.badge} ${styles[`badge${req.urgency_level}`]}`}>
                      {req.urgency_level} Priority
                    </span>
                  </div>
                  {req.description && <p className={styles.reqDesc}>{req.description}</p>}
                  {req.preferred_skills && (
                    <p className={styles.reqSkills}>
                      <HiOutlineBriefcase size={14} /> Skills: {req.preferred_skills}
                    </p>
                  )}
                  <p className={styles.reqDate}>
                    Posted: {new Date(req.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Applications */}
        {applications.length > 0 && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Applications Received</h2>
            <div className={styles.cardList}>
              {applications.map(app => (
                <div key={app._id} className={styles.appCard}>
                  <div className={styles.appHeader}>
                    <div>
                      <h3>{app.user_id?.name || 'Unknown User'}</h3>
                      <p className={styles.appSub}>{app.user_id?.email}</p>
                    </div>
                    <span className={`${styles.badge} ${styles[`badgeStatus${app.status}`]}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className={styles.appMeta}>
                    Applied for: <strong>{app.requirement_id?.title}</strong> ({app.requirement_id?.category})
                  </p>
                  {app.user_id?.skills && <p className={styles.appSkills}>Skills: {app.user_id.skills}</p>}
                  {app.cover_letter && <p className={styles.appCover}>{app.cover_letter}</p>}
                  {app.status === 'Pending' && (
                    <div className={styles.appActions}>
                      <button className={styles.btnAccept} onClick={() => handleAppStatus(app._id, 'Accepted')}>
                        Accept
                      </button>
                      <button className={styles.btnReject} onClick={() => handleAppStatus(app._id, 'Rejected')}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Post New Requirement</h2>
            <form onSubmit={handlePost}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input type="text" className={styles.input} placeholder="e.g. Full Stack Developer"
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Category *</label>
                  <select className={styles.input} value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option>Funding</option><option>Talent</option>
                    <option>Mentorship</option><option>Partnership</option><option>Other</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Urgency</label>
                  <select className={styles.input} value={formData.urgency_level}
                    onChange={e => setFormData({...formData, urgency_level: e.target.value})}>
                    <option>Low</option><option>Medium</option><option>High</option>
                  </select>
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Preferred Skills</label>
                <input type="text" className={styles.input} placeholder="React, Node.js, TypeScript"
                  value={formData.preferred_skills} onChange={e => setFormData({...formData, preferred_skills: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea className={styles.textarea} rows={3} placeholder="Describe the requirement..."
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className={styles.btnPost} disabled={loading}>
                  {loading ? 'Posting...' : 'Post Requirement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
