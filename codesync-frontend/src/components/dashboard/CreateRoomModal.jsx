import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Modal dialog for provisioning a new collaborative coding room.
 */
export function CreateRoomModal({
  isOpen,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    name: '',
    language: 'java',
    maxMembers: 5,
  });

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="dash-modal animate-slide-up" role="dialog" aria-modal="true" aria-labelledby="create-room-heading">
      <h3 id="create-room-heading">Create a New Room</h3>
      <form onSubmit={handleSubmit} className="modal-form">
        <input
          type="text"
          className="input-field"
          placeholder="Room name (e.g., LeetCode Sprint, Algorithms Sync)"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          required
          autoFocus
        />
        <div className="modal-row">
          <select
            className="input-field"
            value={formData.language}
            onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
            aria-label="Default Programming Language"
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
          <input
            type="number"
            className="input-field"
            placeholder="Max members"
            value={formData.maxMembers}
            onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: parseInt(e.target.value, 10) || 5 }))}
            min={2}
            max={10}
            aria-label="Maximum Room Members"
          />
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
}

CreateRoomModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};
