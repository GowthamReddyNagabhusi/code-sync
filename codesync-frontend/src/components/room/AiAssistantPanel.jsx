import PropTypes from 'prop-types';
import { Bot, X, Loader2, FileSearch, Bug, BarChart3, Lightbulb } from 'lucide-react';

const CATEGORY_META = {
  review: { label: 'Code Review', icon: FileSearch },
  bugs: { label: 'Bug Detection', icon: Bug },
  complexity: { label: 'Complexity Analysis', icon: BarChart3 },
  hint: { label: 'Hint', icon: Lightbulb },
};

/**
 * Sidebar drawer displaying GPT-4o code review and analysis insights.
 */
export function AiAssistantPanel({
  isAnalyzing,
  aiResult,
  onClose,
}) {
  const ActiveIcon = aiResult?.type && CATEGORY_META[aiResult.type]
    ? CATEGORY_META[aiResult.type].icon
    : Bot;

  const activeLabel = aiResult?.type && CATEGORY_META[aiResult.type]
    ? CATEGORY_META[aiResult.type].label
    : 'AI Analysis';

  return (
    <div className="sidebar-panel ai-panel animate-slide-up" role="region" aria-label="AI Assistant Panel">
      <div className="sidebar-panel-header">
        <h3>
          <Bot size={16} /> AI Assistant
        </h3>
        <button
          type="button"
          className="btn-icon"
          onClick={onClose}
          title="Close AI Assistant"
          aria-label="Close AI Assistant"
        >
          <X size={14} />
        </button>
      </div>

      <div className="ai-body">
        {isAnalyzing ? (
          <div className="ai-loading">
            <Loader2 size={24} className="spin" />
            <span>Analyzing code structure with GPT-4o...</span>
          </div>
        ) : aiResult ? (
          <div className="ai-result">
            <div className="ai-result-type">
              <ActiveIcon size={14} />
              <span>{activeLabel}</span>
            </div>
            <div className="ai-result-content">
              {aiResult.analysis}
            </div>
            {aiResult.processingTimeMs !== undefined && (
              <div className="ai-result-time">
                Processed in {aiResult.processingTimeMs}ms
              </div>
            )}
          </div>
        ) : (
          <p className="ai-empty">Select an AI action above to review code or detect potential issues.</p>
        )}
      </div>
    </div>
  );
}

AiAssistantPanel.propTypes = {
  isAnalyzing: PropTypes.bool.isRequired,
  aiResult: PropTypes.shape({
    analysis: PropTypes.string,
    type: PropTypes.oneOf(['review', 'bugs', 'complexity', 'hint']),
    processingTimeMs: PropTypes.number,
  }),
  onClose: PropTypes.func.isRequired,
};
