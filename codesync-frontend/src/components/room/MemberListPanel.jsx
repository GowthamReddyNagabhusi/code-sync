import PropTypes from 'prop-types';
import { Users } from 'lucide-react';

/**
 * Sidebar panel displaying current room participants, roles, and real-time presence.
 */
export function MemberListPanel({
  members,
  activeCollaboratorEmails,
  currentUserEmail,
}) {
  const memberList = members || [];

  return (
    <div className="sidebar-panel members-panel" role="region" aria-label="Room Members List">
      <div className="sidebar-panel-header">
        <h3>
          <Users size={16} /> Members
        </h3>
        <span className="member-count">{memberList.length}</span>
      </div>

      <div className="members-list">
        {memberList.map((participant) => {
          const isCurrentUser = participant.email === currentUserEmail;
          const isOnline =
            activeCollaboratorEmails.includes(participant.email) ||
            activeCollaboratorEmails.includes(participant.username) ||
            isCurrentUser;

          const avatarInitial = participant.username?.[0]?.toUpperCase() || '?';
          const avatarBackground =
            participant.role === 'OWNER'
              ? 'var(--gradient-primary)'
              : 'var(--bg-input)';

          return (
            <div key={participant.userId || participant.email} className="member-item">
              <div
                className="member-avatar"
                style={{ background: avatarBackground }}
                aria-hidden="true"
              >
                {avatarInitial}
              </div>

              <div className="member-info">
                <span className="member-name">
                  {participant.username}
                  {isCurrentUser && ' (you)'}
                </span>
                <span className="member-role">{participant.role}</span>
              </div>

              <div
                className={`member-status ${isOnline ? 'online' : ''}`}
                title={isOnline ? 'Online' : 'Offline'}
                aria-label={isOnline ? 'Online' : 'Offline'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

MemberListPanel.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      username: PropTypes.string,
      email: PropTypes.string,
      role: PropTypes.string,
    })
  ),
  activeCollaboratorEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  currentUserEmail: PropTypes.string,
};
