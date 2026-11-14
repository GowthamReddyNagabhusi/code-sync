import { useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles, X, Loader2, FileSearch, Bug,
  BarChart3, Lightbulb, Send, Copy, Check, RefreshCw
} from 'lucide-react';

const CATEGORIES = [
  { id: 'review', label: 'Code Review', icon: FileSearch, desc: 'Quality, structure & idioms' },
  { id: 'bugs', label: 'Bug Hunter', icon: Bug, desc: 'Edge cases & vulnerabilities' },
  { id: 'complexity', label: 'Complexity', icon: BarChart3, desc: 'Big-O time & space' },
  { id: 'hint', label: 'Hint / Guidance', icon: Lightbulb, desc: 'Hints without spoiling' },
];

/**
 * Modern AI Co-Pilot Panel powered by Google Gemini.
 */
export function AiAssistantPanel({
  isAnalyzing,
  aiResult,
  activeCategory,
  onTriggerAnalysis,
  onClose,
  onClear,
}) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim() || isAnalyzing) return;
    onTriggerAnalysis('hint', customPrompt.trim());
    setCustomPrompt('');
  };

  const handleCopyAnalysis = () => {
    if (!aiResult?.analysis) return;
    navigator.clipboard.writeText(aiResult.analysis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="ai-copilot-container" role="region" aria-label="AI Co-Pilot Panel">
      {/* Header */}
      <div className="ai-copilot-header">
        <div className="ai-title-wrap">
          <div className="ai-badge-icon">
            <Sparkles size={16} className="sparkle-pulse" />
          </div>
          <div>
            <h3>Gemini Co-Pilot</h3>
            <span className="ai-model-tag">gemini-3.8-flash</span>
          </div>
        </div>
        <div className="ai-header-actions">
          {aiResult && (
            <button
              type="button"
              className="btn-icon-subtle"
              onClick={onClear}
              title="Clear Analysis"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={onClose}
            title="Close AI Assistant"
            aria-label="Close AI Assistant"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="ai-actions-grid">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id && !aiResult;
          return (
            <button
              key={cat.id}
              type="button"
              className={`ai-chip ${isActive ? 'active' : ''}`}
              onClick={() => onTriggerAnalysis(cat.id)}
              disabled={isAnalyzing}
              title={cat.desc}
            >
              <Icon size={14} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Prompt Input */}
      <form className="ai-prompt-form" onSubmit={handleCustomSubmit}>
        <div className="ai-input-wrapper">
          <input
            type="text"
            className="ai-prompt-input"
            placeholder="Ask Gemini anything about your code..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isAnalyzing}
          />
          <button
            type="submit"
            className="ai-send-btn"
            disabled={!customPrompt.trim() || isAnalyzing}
            title="Send to Gemini"
          >
            {isAnalyzing ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
          </button>
        </div>
      </form>

      {/* Main Content Area */}
      <div className="ai-content-body">
        {isAnalyzing ? (
          <div className="ai-loading-state">
            <div className="ai-glow-orb">
              <Sparkles size={28} className="spin-slow" />
            </div>
            <h4>Analyzing your code with Gemini AI...</h4>
            <p>Evaluating logic, performance, and best practices</p>
          </div>
        ) : aiResult ? (
          <div className="ai-response-card">
            <div className="ai-card-meta">
              <div className="ai-category-pill">
                <Sparkles size={12} />
                <span>{aiResult.type?.toUpperCase() || 'ANALYSIS'}</span>
              </div>
              <div className="ai-meta-right">
                {aiResult.processingTimeMs && (
                  <span className="ai-time-chip">⚡ {aiResult.processingTimeMs}ms</span>
                )}
                <button
                  type="button"
                  className="ai-copy-btn"
                  onClick={handleCopyAnalysis}
                  title="Copy analysis to clipboard"
                >
                  {copied ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="ai-markdown-rendered markdown-body">
              <ReactMarkdown>{aiResult.analysis}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="ai-placeholder-state">
            <div className="ai-empty-illustration">
              <Sparkles size={32} />
            </div>
            <h4>Ready to assist</h4>
            <p>Choose an action above like <strong>Code Review</strong> or <strong>Bug Hunter</strong>, or ask a question about your code.</p>
            <div className="ai-features-list">
              <div className="ai-feature-row">
                <FileSearch size={14} /> <span>Senior developer code reviews & idioms</span>
              </div>
              <div className="ai-feature-row">
                <Bug size={14} /> <span>Deep runtime & security bug detection</span>
              </div>
              <div className="ai-feature-row">
                <BarChart3 size={14} /> <span>Algorithmic Big-O time & space breakdown</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

AiAssistantPanel.propTypes = {
  isAnalyzing: PropTypes.bool.isRequired,
  aiResult: PropTypes.shape({
    analysis: PropTypes.string,
    type: PropTypes.string,
    processingTimeMs: PropTypes.number,
  }),
  activeCategory: PropTypes.string,
  onTriggerAnalysis: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
