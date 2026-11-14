import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft, Copy, Check, Hash, Play,
  Loader2, Sparkles, Users
} from 'lucide-react';

/**
 * Top control and status bar for the collaborative room session.
 */
export const RoomHeader = memo(function RoomHeader({
  roomName,
  roomCode,
  isCopied,
  onCopyRoomCode,
  selectedLanguage,
  onLanguageChange,
  isExecuting,
  onRunCode,
  activeSidebarTab,
  onToggleSidebarTab,
  collaboratorCount,
  onNavigateBack,
}) {
  return (
    <header className="room-topbar">
      <div className="room-topbar-left">
        <button
          type="button"
          className="btn-icon-modern"
          onClick={onNavigateBack}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="room-topbar-info">
          <h2>{roomName || 'Collaborative Room'}</h2>
          <button
            type="button"
            className="room-code-badge"
            onClick={onCopyRoomCode}
            title="Click to copy room code"
          >
            <Hash size={12} />
            <span>{roomCode}</span>
            {isCopied ? <Check size={12} className="copy-check" /> : <Copy size={12} />}
          </button>
        </div>
      </div>

      <div className="room-topbar-center">
        <div className="lang-selector-pill">
          <span className="lang-dot" />
          <select
            className="lang-select"
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Select Programming Language"
          >
            <option value="java">Java 21</option>
            <option value="python">Python 3.12</option>
            <option value="cpp">C++ 20</option>
          </select>
        </div>
      </div>

      <div className="room-topbar-right">
        {/* Run Code Button */}
        <button
          type="button"
          className={`btn-run-modern ${isExecuting ? 'executing' : ''}`}
          onClick={onRunCode}
          disabled={isExecuting}
          title="Execute code in sandboxed Docker container"
        >
          {isExecuting ? <Loader2 size={15} className="spin" /> : <Play size={15} fill="currentColor" />}
          <span>{isExecuting ? 'Running...' : 'Run Code'}</span>
        </button>

        {/* Gemini AI Co-Pilot Toggle */}
        <button
          type="button"
          className={`btn-ai-modern ${activeSidebarTab === 'ai' ? 'active' : ''}`}
          onClick={() => onToggleSidebarTab('ai')}
          title="Open Gemini AI Co-Pilot"
        >
          <Sparkles size={15} className="sparkle-pulse" />
          <span>Gemini AI</span>
          <span className="ai-status-dot" />
        </button>

        {/* Collaborators Toggle */}
        <button
          type="button"
          className={`btn-collab-modern ${activeSidebarTab === 'members' ? 'active' : ''}`}
          onClick={() => onToggleSidebarTab('members')}
          title="Toggle collaborators list"
        >
          <Users size={15} />
          <span>{collaboratorCount || 1}</span>
        </button>
      </div>
    </header>
  );
});

RoomHeader.propTypes = {
  roomName: PropTypes.string,
  roomCode: PropTypes.string.isRequired,
  isCopied: PropTypes.bool.isRequired,
  onCopyRoomCode: PropTypes.func.isRequired,
  selectedLanguage: PropTypes.string.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  isExecuting: PropTypes.bool.isRequired,
  onRunCode: PropTypes.func.isRequired,
  activeSidebarTab: PropTypes.string,
  onToggleSidebarTab: PropTypes.func.isRequired,
  collaboratorCount: PropTypes.number,
  onNavigateBack: PropTypes.func.isRequired,
};
