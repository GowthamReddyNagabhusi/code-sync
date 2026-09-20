import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Editor from '@monaco-editor/react';

const MONACO_LANGUAGE_MAP = {
  java: 'java',
  python: 'python',
  cpp: 'cpp',
};

/**
 * Collaborative Monaco editor wrapper with optimized, stable options.
 */
export function CodeEditor({
  code,
  language,
  onCodeChange,
  onEditorMount,
}) {
  const monacoLanguage = MONACO_LANGUAGE_MAP[language] || 'java';

  const editorOptions = useMemo(() => ({
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    padding: { top: 16 },
    lineNumbers: 'on',
    renderLineHighlight: 'line',
    cursorBlinking: 'smooth',
    smoothScrolling: true,
    bracketPairColorization: { enabled: true },
    autoIndent: 'full',
    tabSize: 4,
    wordWrap: 'on',
  }), []);

  return (
    <div className="editor-container">
      <Editor
        height="100%"
        language={monacoLanguage}
        value={code}
        onChange={onCodeChange}
        onMount={onEditorMount}
        theme="vs-dark"
        options={editorOptions}
      />
    </div>
  );
}

CodeEditor.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string.isRequired,
  onCodeChange: PropTypes.func.isRequired,
  onEditorMount: PropTypes.func,
};
