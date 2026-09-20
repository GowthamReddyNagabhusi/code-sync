import { memo } from 'react';
import PropTypes from 'prop-types';
import { Code2, LogOut } from 'lucide-react';

/**
 * Top navigation bar for the user dashboard.
 */
export const DashboardNav = memo(function DashboardNav({
  username,
  onLogout,
}) {
  const avatarInitial = username?.[0]?.toUpperCase() || '?';

  return (
    <nav className="dash-nav">
      <div className="dash-nav-brand">
        <Code2 size={24} />
        <span className="gradient-text">CodeSync</span>
      </div>
      <div className="dash-nav-right">
        <div className="dash-user">
          <div className="dash-avatar" aria-hidden="true">{avatarInitial}</div>
          <span>{username}</span>
        </div>
        <button
          type="button"
          className="btn-icon"
          onClick={onLogout}
          title="Sign out of CodeSync"
          aria-label="Sign out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
});

DashboardNav.propTypes = {
  username: PropTypes.string,
  onLogout: PropTypes.func.isRequired,
};
