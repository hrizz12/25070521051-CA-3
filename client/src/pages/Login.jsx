import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { user, loading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Spinner fullPage />;
  if (user) return <Navigate to="/" replace />; // already signed in

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validate() {
    const found = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = 'Enter a valid email address';
    if (!form.password) found.password = 'Password is required';
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
      await login({ email: form.email.trim(), password: form.password });
      toast.success('Welcome back!');
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Pick up where you left off."
      footer={
        <>
          New to ShotList? <Link to="/register">Create an account</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <div className="form-alert">{serverError}</div>}

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
            autoFocus
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            placeholder="Your password"
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthLayout>
  );
}
