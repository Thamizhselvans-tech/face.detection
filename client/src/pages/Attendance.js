import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import { markAttendance } from '../services/api';
import { useAuth } from '../context/AuthContext';
import useCamera from '../hooks/useCamera';
import { capitalize, formatDateTime } from '../utils/format';

const STATUS_META = {
  present: { icon: '✅', label: 'Present',  cls: 'present' },
  late:    { icon: '⏰', label: 'Late',     cls: 'late'    },
  absent:  { icon: '❌', label: 'Absent',   cls: 'absent'  },
};

const Attendance = () => {
  const { student } = useAuth();
  const navigate = useNavigate();

  const {
    videoRef, canvasRef,
    state: camState,
    cameraError, capturedImage,
    start, capture, reset,
  } = useCamera();

  const [submitting, setSubmitting]   = useState(false);
  const [result,     setResult]       = useState(null);
  const [submitErr,  setSubmitErr]    = useState(null);

  const handleCapture = () => {
    setResult(null);
    setSubmitErr(null);
    capture();
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;
    setSubmitting(true);
    setSubmitErr(null);

    try {
      const { data } = await markAttendance(capturedImage);
      setResult({
        status:    (data.status || 'present').toLowerCase(),
        message:   data.message || 'Attendance recorded.',
        timestamp: data.timestamp || new Date().toISOString(),
        student:   data.studentName || student?.name,
      });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Face not recognised or server error. Please try again.';
      setSubmitErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
    setSubmitErr(null);
  };

  const meta = result ? (STATUS_META[result.status] || STATUS_META.present) : null;

  return (
    <div className="page page--start">
      <div className="attendance-layout">

        {/* ── Camera card ── */}
        <div className="cam-card">
          <div className="cam-card__header">
            <h1 className="cam-card__title">Mark Attendance</h1>
            {student?.name && (
              <span style={{
                fontFamily: 'var(--f-mono)',
                fontSize: '0.72rem',
                background: 'var(--amber-dim)',
                color: 'var(--amber)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: 20,
                padding: '0.2rem 0.65rem',
              }}>
                {student.name.split(' ')[0]}
              </span>
            )}
          </div>

          {/* ── Viewport ── */}
          <div className="cam-viewport">

            {/* Live video */}
            <video
              ref={videoRef}
              className="cam-video"
              muted
              playsInline
              aria-label="Camera preview"
              style={{ display: camState === 'active' ? 'block' : 'none' }}
            />

            {/* Scan frame overlay */}
            {camState === 'active' && (
              <>
                <div className="cam-frame"><div className="cam-frame__br" /></div>
                <div className="cam-scan-line" />
              </>
            )}

            {/* Captured still */}
            {camState === 'captured' && capturedImage && (
              <>
                <img
                  src={capturedImage}
                  alt="Captured frame"
                  className="cam-captured-img"
                />
                <div className="cam-captured-badge">CAPTURED</div>
              </>
            )}

            {/* Idle / requesting / error overlays */}
            {(camState === 'idle' || camState === 'requesting' || camState === 'error') && (
              <div className="cam-overlay">
                {camState === 'requesting' && (
                  <>
                    <div className="cam-overlay__icon" style={{ animation: 'framePulse 1.5s ease-in-out infinite' }}>📷</div>
                    <span>Requesting camera access…</span>
                  </>
                )}
                {camState === 'idle' && !cameraError && (
                  <>
                    <div className="cam-overlay__icon">🎥</div>
                    <span>Camera is off</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--slate-2)' }}>
                      Press "Start Camera" below
                    </span>
                  </>
                )}
                {camState === 'error' && (
                  <>
                    <div className="cam-overlay__icon">⚠️</div>
                    <span style={{ color: 'var(--red)', textAlign: 'center', padding: '0 1rem' }}>
                      {cameraError}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Hidden canvas for frame extraction */}
          <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true" />

          {/* Tip */}
          {camState === 'active' && (
            <div className="cam-tip">
              <span>💡</span>
              <span>Centre your face in the frame. Ensure good lighting and face the camera directly.</span>
            </div>
          )}

          {/* ── Controls ── */}
          <div className="cam-controls">
            {(camState === 'idle' || camState === 'error') && (
              <button className="btn btn--primary" onClick={start}>
                📷 Start Camera
              </button>
            )}

            {camState === 'active' && (
              <>
                <button className="btn btn--ghost" onClick={handleReset}>
                  ✕ Cancel
                </button>
                <button className="btn btn--primary" onClick={handleCapture}>
                  📸 Capture
                </button>
              </>
            )}

            {camState === 'captured' && (
              <>
                <button className="btn btn--ghost" onClick={handleReset} disabled={submitting}>
                  🔄 Retake
                </button>
                <button
                  className="btn btn--primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="spinner spinner--amber" /> Processing…</>
                  ) : '✓ Submit'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── Submit error ── */}
        {submitErr && (
          <Alert type="error" title="Submission Failed" message={submitErr} onDismiss={() => setSubmitErr(null)} />
        )}

        {/* ── Result card ── */}
        {result && meta && (
          <div className={`result-card result-card--${meta.cls}`}>
            <div className="result-icon" aria-hidden="true">{meta.icon}</div>
            <div className={`result-status result-status--${meta.cls}`}>
              {capitalize(result.status)}
            </div>
            {result.student && (
              <p style={{ color: 'var(--slate)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
                {result.student}
              </p>
            )}
            <p className="result-message">{result.message}</p>
            <p className="result-time">🕐 {formatDateTime(result.timestamp)}</p>

            <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem', justifyContent: 'center' }}>
              <button className="btn btn--ghost btn--sm" onClick={handleReset}>
                Mark Again
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Security notice */}
        <div className="security-badge" style={{ justifyContent: 'center' }}>
          <span className="security-badge__dot" />
          Attendance request includes your JWT token for identity verification.
        </div>

      </div>
    </div>
  );
};

export default Attendance;
