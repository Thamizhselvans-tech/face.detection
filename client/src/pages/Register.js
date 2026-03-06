import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import FaceUpload from '../components/FaceUpload';
import Alert from '../components/Alert';
import { registerStudent } from '../services/api';
import { validateRegisterStep1, validateRegisterStep2 } from '../utils/validators';

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Data Science',
  'Artificial Intelligence & ML',
  'Other',
];

const INITIAL = {
  name:            '',
  registerNumber:  '',
  department:      '',
  email:           '',
  password:        '',
  confirmPassword: '',
};

const Register = () => {
  const navigate = useNavigate();

  const [step,      setStep]      = useState(1);
  const [form,      setForm]      = useState(INITIAL);
  const [faceImage, setFaceImage] = useState(null);
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [apiAlert,  setApiAlert]  = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  // ── Step 1 ────────────────────────────────────────────────────────
  const handleStep1 = (e) => {
    e.preventDefault();
    const errs = validateRegisterStep1(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStep(2);
  };

  // ── Step 2 / Submit ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateRegisterStep2(form, faceImage);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiAlert(null);

    try {
      const fd = new FormData();
      fd.append('name',           form.name.trim());
      fd.append('registerNumber', form.registerNumber.trim());
      fd.append('department',     form.department);
      fd.append('email',          form.email.trim().toLowerCase());
      fd.append('password',       form.password);
      fd.append('faceImage',      faceImage, faceImage.name);

      await registerStudent(fd);

      setApiAlert({
        type:    'success',
        message: 'Account created successfully! Redirecting to login…',
      });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        'Registration failed. Please try again.';
      setApiAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicator ────────────────────────────────────────────────
  const stepState = (n) =>
    n < step ? 'done' : n === step ? 'active' : 'pending';

  return (
    <div className="page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        {/* Logo */}
        <div className="auth-card__logo" aria-hidden="true">📷</div>

        {/* Steps */}
        <div className="steps" aria-label="Registration steps">
          {[
            { n: 1, label: 'Personal Info' },
            { n: 2, label: 'Security & Face' },
          ].map((s, i, arr) => (
            <React.Fragment key={s.n}>
              <div className={`step step--${stepState(s.n)}`}>
                <div className="step__num" aria-hidden="true">
                  {stepState(s.n) === 'done' ? '✓' : s.n}
                </div>
                <span>{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="step__connector" />}
            </React.Fragment>
          ))}
        </div>

        <p className="auth-card__eyebrow">Step {step} of 2</p>
        <h1 className="auth-card__title">
          {step === 1 ? 'Create Account' : 'Set Credentials'}
        </h1>
        <p className="auth-card__subtitle">
          {step === 1
            ? 'Enter your academic details to get started.'
            : 'Choose a password and upload your face photo.'}
        </p>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <form className="form" onSubmit={handleStep1} noValidate>
            <div className="form-row">
              <FormField
                label="Full Name" name="name" required
                value={form.name} onChange={handleChange}
                placeholder="Jane Smith"
                error={errors.name}
                autoComplete="name"
              />
              <FormField
                label="Register Number" name="registerNumber" required
                value={form.registerNumber} onChange={handleChange}
                placeholder="CS21001"
                error={errors.registerNumber}
                autoComplete="off"
              />
            </div>

            <FormField label="Department" name="department" required error={errors.department}>
              <select
                id="field-department"
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`field__input field__select ${errors.department ? 'field__input--error' : ''}`}
                aria-required="true"
              >
                <option value="">Select department…</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </FormField>

            <FormField
              label="Email Address" name="email" type="email" required
              value={form.email} onChange={handleChange}
              placeholder="jane@university.edu"
              error={errors.email}
              autoComplete="email"
            />

            <button type="submit" className="btn btn--primary" style={{ marginTop: '0.4rem' }}>
              Continue →
            </button>

            <div className="auth-link">
              Already registered? <Link to="/login">Sign in</Link>
            </div>
          </form>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <FormField
                label="Password" name="password" type="password" required
                value={form.password} onChange={handleChange}
                placeholder="Min 6 characters"
                error={errors.password}
                autoComplete="new-password"
              />
              <FormField
                label="Confirm Password" name="confirmPassword" type="password" required
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Repeat password"
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            <FaceUpload onFileSelect={setFaceImage} error={errors.faceImage} />

            {apiAlert && (
              <Alert
                type={apiAlert.type}
                message={apiAlert.message}
                onDismiss={() => setApiAlert(null)}
              />
            )}

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setStep(1)}
                disabled={loading}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? (
                  <><span className="spinner spinner--amber" /> Creating…</>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        {/* Security notice */}
        <div className="security-badge">
          <span className="security-badge__dot" />
          Your face data is encrypted and stored securely.
        </div>
      </div>
    </div>
  );
};

export default Register;
