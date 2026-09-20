import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Code2, Mail, Lock, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setAuthError('');
    setIsSubmitting(true);
    try {
      await login(emailAddress, password);
    } catch (submitError) {
      setAuthError(submitError.message || 'Failed to authenticate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container animate-fade-in">
        <Link to="/" className="auth-brand" aria-label="CodeSync Home">
          <Code2 size={32} />
          <span className="gradient-text">CodeSync</span>
        </Link>
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue coding</p>

        {authError && <div className="auth-error" role="alert">{authError}</div>}

        <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input
              type="email"
              className="input-field"
              placeholder="Email address"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
