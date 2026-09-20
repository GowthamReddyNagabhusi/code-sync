import { memo } from 'react';
import PropTypes from 'prop-types';
import { Users, Clock, ArrowRight, Copy, Check, Hash, Trash2, DoorOpen } from 'lucide-react';

const LANGUAGE_BADGE_THEMES = {
  java: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  python: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  cpp: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
};

/**
 * Single collaborative room card displayed in the dashboard grid.
 */
export const RoomCard = memo(function RoomCard({
  room,
  currentUsername,
  isCopied,
  onCopyRoomCode,
  onEnterRoom,
  onDeleteRoom,
  onLeaveRoom,
  animationIndex = 0,
}) {
  const isOwner = room.ownerUsername === currentUsername;
  const badgeTheme = LANGUAGE_BADGE_THEMES[room.language] || LANGUAGE_BADGE_THEMES.java;
  const formattedCreatedDate = new Date(room.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article
      className="room-card animate-fade-in"
      style={{ animationDelay: `${animationIndex * 50}ms` }}
    >
      <div className="room-card-header">
        <h3 className="room-card-name">{room.name}</h3>
        <span
          className="room-lang-badge"
          style={{
            background: badgeTheme.bg,
            color: badgeTheme.color,
          }}
        >
          {room.language}
        </span>
      </div>

      <button
        type="button"
        className="room-card-code"
        onClick={() => onCopyRoomCode(room.roomCode)}
        title="Click to copy room code"
        aria-label={`Copy room code ${room.roomCode}`}
      >
        <Hash size={14} />
        <span>{room.roomCode}</span>
        {isCopied ? <Check size={14} className="copy-check" /> : <Copy size={14} />}
      </button>

      <div className="room-card-meta">
        <span>
          <Users size={14} /> {room.currentMembers}/{room.maxMembers}
        </span>
        <span>
          <Clock size={14} /> {formattedCreatedDate}
        </span>
      </div>

      <div className="room-card-actions">
        <button
          type="button"
          className="btn-primary room-enter-btn"
          onClick={() => onEnterRoom(room.roomCode)}
        >
          Enter Room <ArrowRight size={16} />
        </button>

        {isOwner ? (
          <button
            type="button"
            className="btn-icon btn-danger-icon"
            onClick={() => onDeleteRoom(room.roomCode)}
            title="Delete room"
            aria-label="Delete room"
          >
            <Trash2 size={16} />
          </button>
        ) : (
          <button
            type="button"
            className="btn-icon"
            onClick={() => onLeaveRoom(room.roomCode)}
            title="Leave room"
            aria-label="Leave room"
          >
            <DoorOpen size={16} />
          </button>
        )}
      </div>
    </article>
  );
});

RoomCard.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
    roomCode: PropTypes.string.isRequired,
    language: PropTypes.string.isRequired,
    currentMembers: PropTypes.number,
    maxMembers: PropTypes.number,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
    ownerUsername: PropTypes.string,
  }).isRequired,
  currentUsername: PropTypes.string,
  isCopied: PropTypes.bool.isRequired,
  onCopyRoomCode: PropTypes.func.isRequired,
  onEnterRoom: PropTypes.func.isRequired,
  onDeleteRoom: PropTypes.func.isRequired,
  onLeaveRoom: PropTypes.func.isRequired,
  animationIndex: PropTypes.number,
};
