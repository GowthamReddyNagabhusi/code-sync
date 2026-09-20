import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal dialog for joining an existing room with an 8-character room code.
 */
export function JoinRoomModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [roomCode, setRoomCode] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) return;
    onSubmit(cleanCode);
  };

  return (
    <div className="dash-modal animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="join-room-heading">
      <h3 id="join-room-heading">Join a Room</h3>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          className="input-field"
          placeholder="Enter room code (e.g., A3X9K2M1)"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          maxLength={8}
          required
          autoFocus
          style={{
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.1em',
            textAlign: 'center',
            fontSize: '1.2rem',
          }}
          aria-label="8-Character Room Code"
        />
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Join Room
          </button>
        </div>
      </form>
    </div>
  );
}

JoinRoomModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
