import PropTypes from 'prop-types';
import { Terminal, X, Loader2 } from 'lucide-react';

/**
 * Terminal output panel rendering Docker sandbox execution responses.
 */
export function ExecutionPanel({
  isExecuting,
  executionResult,
  onClose,
}) {
  return (
    <div className="output-panel animate-slide-up" role="region" aria-label="Execution Output Terminal">
      <div className="output-header">
        <div className="output-title">
          <Terminal size={16} />
          <span>Output</span>
          {executionResult && (
            <span className={`output-status ${executionResult.success ? 'success' : 'error'}`}>
              {executionResult.success ? '✓ Passed' : '✗ Failed'}
              {executionResult.executionTimeMs !== undefined && ` (${executionResult.executionTimeMs}ms)`}
            </span>
          )}
        </div>
        <button
          type="button"
          className="btn-icon"
          onClick={onClose}
          title="Close execution terminal"
          aria-label="Close execution terminal"
        >
          <X size={16} />
        </button>
      </div>

      <div className="output-body">
        {isExecuting ? (
          <div className="output-loading">
            <Loader2 size={20} className="spin" />
            <span>Executing in isolated sandbox...</span>
          </div>
        ) : executionResult ? (
          <>
            {executionResult.stdout && (
              <pre className="output-stdout">{executionResult.stdout}</pre>
            )}
            {executionResult.stderr && (
              <pre className="output-stderr">{executionResult.stderr}</pre>
            )}
            {executionResult.timedOut && (
              <pre className="output-stderr">⏱ Execution timed out (exceeded limit)</pre>
            )}
            {!executionResult.stdout && !executionResult.stderr && !executionResult.timedOut && (
              <pre className="output-stdout">(No output produced)</pre>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

ExecutionPanel.propTypes = {
  isExecuting: PropTypes.bool.isRequired,
  executionResult: PropTypes.shape({
    stdout: PropTypes.string,
    stderr: PropTypes.string,
    success: PropTypes.bool,
    exitCode: PropTypes.number,
    executionTimeMs: PropTypes.number,
    timedOut: PropTypes.bool,
  }),
  onClose: PropTypes.func.isRequired,
};
