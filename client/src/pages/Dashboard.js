import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import SecureImage from '../components/SecureImage';
import Alert from '../components/Alert';
import PageLoader from '../components/PageLoader';
import { formatDateTime } from '../utils/format';

const MetaItem = ({ label, value, mono = false }) => (
  <div className="dash-meta__item">
    <div>
      <div className="dash-meta__label">{label}</div>
      <div className="dash-meta__value" style={mono ? { fontFamily: 'var(--f-mono)', fontSize: '0.88rem' } : {}}>
        {value || '—'}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { student: cachedStudent, logout, updateStudent } = useAuth();
  const navigate = useNavigate();

  const [profile,  setProfile]  = useState(cachedStudent);
  const [loading,  setLoading]  = useState(!cachedStudent);
  const [fetchErr, setFetchErr] = useState(null);

  // Always re-fetch fresh profile from backend (guards against stale cache)
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchErr(null);

    getMyProfile()
      .then(({ data }) => {
        if (cancelled) return;
        const studentData = data.student || data;
        setProfile(studentData);
        updateStudent(studentData);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg =
          err.response?.data?.message ||
          'Failed to load profile. Please refresh.';
        setFetchErr(msg);
        // Fall back to cached data
        if (cachedStudent) setProfile(cachedStudent);
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) return <PageLoader text="Loading your profile…" />;

  if (!profile && fetchErr) {
    return (
      <div className="page">
        <div className="auth-card">
          <Alert type="error" title="Could not load profile" message={fetchErr} />
          <button onClick={() => window.location.reload()} className="btn btn--ghost" style={{ marginTop: '1rem', width: '100%' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Determine image source.
  // Priority: photoUrl (public CDN) → photoPath (protected route)
  const publicSrc   = profile?.photoUrl   || null;
  const secureSrc   = profile?.photoPath  || '/api/student/me/photo';

  return (
    <div className="page page--start">
      <div className="dashboard">

        {/* ── Error banner (non-fatal) ── */}
        {fetchErr && (
          <Alert
            type="warning"
            message="Could not refresh profile — showing cached data."
          />
        )}

        {/* ── Hero card ── */}
        <div className="dash-hero">
          {/* Photo — securely fetched through Axios w/ JWT header */}
          <div className="dash-hero__photo-wrap">
            <SecureImage
              publicSrc={publicSrc}
              src={publicSrc ? null : secureSrc}
              alt={`${profile?.name}'s photo`}
              className="dash-hero__photo"
              fallback={
                <div className="dash-hero__photo-placeholder" aria-label="No photo">
                  🧑
                </div>
              }
            />
            <div className="dash-hero__photo-badge" aria-label="Verified">✓</div>
          </div>

          {/* Info */}
          <div className="dash-hero__info">
            <div className="dash-hero__eyebrow">Student Profile</div>
            <h1 className="dash-hero__name">{profile?.name || 'Unknown Student'}</h1>

            <div className="dash-meta">
              <MetaItem label="REG. NUMBER" value={profile?.registerNumber} mono />
              <MetaItem label="DEPARTMENT"  value={profile?.department} />
              <MetaItem label="EMAIL"       value={profile?.email} />
              {profile?.createdAt && (
                <MetaItem label="JOINED" value={formatDateTime(profile.createdAt)} />
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1.2rem', flexWrap: 'wrap' }}>
              <Link to="/attendance" className="btn btn--primary" style={{ width: 'auto', padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}>
                📷 Mark Attendance
              </Link>
              <button onClick={handleLogout} className="btn btn--danger btn--sm">
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick action cards ── */}
        <div className="dash-grid">
          <Link to="/attendance" className="dash-card">
            <div className="dash-card__icon">📸</div>
            <div className="dash-card__title">Mark Attendance</div>
            <div className="dash-card__desc">
              Use your camera to capture your face and record today's attendance.
            </div>
            <div className="dash-card__arrow">Open Camera →</div>
          </Link>

          <div className="dash-card" style={{ cursor: 'default' }}>
            <div className="dash-card__icon">🔒</div>
            <div className="dash-card__title">Privacy Protected</div>
            <div className="dash-card__desc">
              Your face image is private. Only you can view your profile photo after authentication.
            </div>
            <div className="dash-card__arrow" style={{ color: 'var(--green)' }}>JWT Secured ✓</div>
          </div>

          <div className="dash-card" style={{ cursor: 'default' }}>
            <div className="dash-card__icon">📊</div>
            <div className="dash-card__title">Attendance History</div>
            <div className="dash-card__desc">
              View your attendance records, streaks and statistics. Coming soon.
            </div>
            <div className="dash-card__arrow" style={{ color: 'var(--slate-2)' }}>Coming soon</div>
          </div>
        </div>

        {/* Security info */}
        <div className="security-badge" style={{ marginTop: 0 }}>
          <span className="security-badge__dot" />
          Session authenticated · Photo access restricted to your account only
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
