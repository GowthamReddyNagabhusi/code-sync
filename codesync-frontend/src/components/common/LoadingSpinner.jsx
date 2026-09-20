import PropTypes from 'prop-types';

/**
 * Standard centered loading spinner screen for routes and heavy panels.
 */
export function LoadingSpinner({ message }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <div className="spinner" />
      {message && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{message}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};
