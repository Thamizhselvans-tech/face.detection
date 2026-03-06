import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import FormField from '../components/FormField';
import Alert from '../components/Alert';
import { useAuth } from '../context/AuthContext';
import { loginStudent } from '../services/api';
import { validateLogin } from '../utils/validators';

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);

  const [form,     setForm]     = useState({ email: '', password: '' });
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiAlert, setApiAlert] = useState(null);

  // Show session-expired banner from query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('session') === 'expired') {
      setApiAlert({ type: 'warning', message: 'Your session expired. Please sign in again.' });
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateLogin(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiAlert(null);

    try {
      const { data } = await loginStudent({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });

      // data should be: { token: string, student: StudentObject }
      if (!data?.token) throw new Error('Invalid server response.');

      login(data.token, data.student);
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error   ||
        err.message                 ||
        'Sign in failed. Check your credentials.';
      setApiAlert({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="auth-card">
        <div className="auth-card__logo" aria-hidden="true">📷</div>
        <p className="auth-card__eyebrow">Secure Access</p>
        <h1 className="auth-card__title">Welcome Back</h1>
        <p className="auth-card__subtitle">Sign in to mark your attendance.</p>

        {apiAlert && (
          <Alert
            type={apiAlert.type}
            message={apiAlert.message}
            onDismiss={() => setApiAlert(null)}
          />
        )}

        <form className="form" onSubmit={handleSubmit} noValidate style={{ marginTop: '1.5rem' }}>
          <FormField
            label="Email Address" name="email" type="email" required
            value={form.email} onChange={handleChange}
            placeholder="jane@university.edu"
            error={errors.email}
            autoComplete="email"
          />

          <FormField
            label="Password" name="password" type="password" required
            value={form.password} onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
          />

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
            style={{ marginTop: '0.6rem' }}
          >
            {loading ? (
              <><span className="spinner spinner--amber" /> Signing in…</>
            ) : 'Sign In →'}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="auth-link">
          No account? <Link to="/register">Register here</Link>
        </div>

        <div className="security-badge">
          <span className="security-badge__dot" />
          JWT-secured session · Token stored locally
        </div>
      </div>
    </div>
  );
};

export default Login;
