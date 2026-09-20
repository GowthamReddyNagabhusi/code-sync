import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Code2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const [desiredUsername, setDesiredUsername] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setRegistrationError('');
    setIsSubmitting(true);
    try {
      await register(desiredUsername, emailAddress, password);
    } catch (submitError) {
      setRegistrationError(submitError.message || 'Registration failed');
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
        <h1>Create account</h1>
        <p className="auth-subtitle">Start collaborating in seconds</p>

        {registrationError && <div className="auth-error" role="alert">{registrationError}</div>}

        <form onSubmit={handleRegisterSubmit} className="auth-form">
          <div className="input-group">
            <User size={18} className="input-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Username"
              value={desiredUsername}
              onChange={(e) => setDesiredUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
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
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn-primary auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
