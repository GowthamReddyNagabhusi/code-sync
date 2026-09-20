import { memo } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft, Copy, Check, Hash, Play,
  Loader2, FileSearch, Bug, BarChart3, Lightbulb, Users
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
  onTriggerAiAnalysis,
  showMembersPanel,
  onToggleMembersPanel,
  onNavigateBack,
}) {
  return (
    <header className="room-topbar">
      <div className="room-topbar-left">
        <button
          type="button"
          className="btn-icon"
          onClick={onNavigateBack}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="room-topbar-info">
          <h2>{roomName || 'Room'}</h2>
          <button
            type="button"
            className="room-topbar-code"
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
        <select
          className="lang-select"
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          aria-label="Select Programming Language"
        >
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <div className="room-topbar-right">
        <button
          type="button"
          className="btn-run"
          onClick={onRunCode}
          disabled={isExecuting}
          title="Execute code in sandboxed Docker container"
        >
          {isExecuting ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
          {isExecuting ? 'Running...' : 'Run'}
        </button>

        <div className="ai-buttons" role="group" aria-label="AI Engineering Tools">
          <button
            type="button"
            className="btn-ai"
            onClick={() => onTriggerAiAnalysis('review')}
            title="AI Code Review"
            aria-label="AI Code Review"
          >
            <FileSearch size={16} />
          </button>
          <button
            type="button"
            className="btn-ai"
            onClick={() => onTriggerAiAnalysis('bugs')}
            title="AI Bug Detection"
            aria-label="AI Bug Detection"
          >
            <Bug size={16} />
          </button>
          <button
            type="button"
            className="btn-ai"
            onClick={() => onTriggerAiAnalysis('complexity')}
            title="AI Complexity Analysis"
            aria-label="AI Complexity Analysis"
          >
            <BarChart3 size={16} />
          </button>
          <button
            type="button"
            className="btn-ai"
            onClick={() => onTriggerAiAnalysis('hint')}
            title="AI Coding Hint"
            aria-label="AI Coding Hint"
          >
            <Lightbulb size={16} />
          </button>
        </div>

        <button
          type="button"
          className={`btn-icon ${showMembersPanel ? 'active' : ''}`}
          onClick={onToggleMembersPanel}
          title="Toggle members sidebar"
          aria-label="Toggle members sidebar"
        >
          <Users size={18} />
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
  onTriggerAiAnalysis: PropTypes.func.isRequired,
  showMembersPanel: PropTypes.bool.isRequired,
  onToggleMembersPanel: PropTypes.func.isRequired,
  onNavigateBack: PropTypes.func.isRequired,
};
