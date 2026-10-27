import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { user, loading, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner fullPage />;
  if (user) return <Navigate to="/" replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // Same rules as the backend (server/src/middleware/validate.js)
  function validate() {
    const found = {};
    const username = form.username.trim();
    if (username.length < 3 || username.length > 30) found.username = 'Username must be 3-30 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (form.password.length < 8) found.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
      found.password = 'Use at least one letter and one number';
    }
    if (form.confirm !== form.password) found.confirm = 'Passwords do not match';
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Account created. Welcome to ShotList!');
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start planning your next shoot in minutes."
      footer={
        <>
          Already have an account? <Link to="/login">Sign in</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <div className="form-alert">{serverError}</div>}

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
            placeholder="e.g. maya_films"
            maxLength={30}
            autoFocus
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
        </div>

        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@studio.com"
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="8+ characters"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>
          <div className="field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
            />
            {errors.confirm && <span className="field-error">{errors.confirm}</span>}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}
