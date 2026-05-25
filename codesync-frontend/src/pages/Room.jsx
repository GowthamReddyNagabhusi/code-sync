import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { useAuth } from '../context/AuthContext';
import { roomApi, execApi, aiApi } from '../services/api';
import {
  Code2, Play, Users, Bot, ArrowLeft, Copy, Check,
  Bug, BarChart3, Lightbulb, FileSearch, X, Loader2,
  ChevronDown, ChevronUp, Hash, Terminal
} from 'lucide-react';
import './Room.css';

const LANG_MAP = {
  java: 'java',
  python: 'python',
  cpp: 'cpp',
};

const LANG_DEFAULTS = {
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSync!");\n    }\n}`,
  python: `def main():\n    print("Hello, CodeSync!")\n\nif __name__ == "__main__":\n    main()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeSync!" << endl;\n    return 0;\n}`,
};

export default function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const wsRef = useRef(null);
  const editorRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('java');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Execution state
  const [execResult, setExecResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [stdin, setStdin] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  // AI state
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAi, setShowAi] = useState(false);

  // Members sidebar
  const [showMembers, setShowMembers] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    fetchRoom();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [roomCode]);

  const fetchRoom = async () => {
    try {
      const data = await roomApi.get(roomCode);
      setRoom(data);
      setLanguage(data.language || 'java');
      setCode(LANG_DEFAULTS[data.language] || LANG_DEFAULTS.java);
      connectWebSocket();
    } catch (err) {
      console.error('Failed to fetch room', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = useCallback(() => {
    const ws = new WebSocket(
      `ws://localhost:8080/ws/editor?token=${token}&roomCode=${roomCode}`
    );

    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({ type: 'SYNC_REQUEST', roomCode }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case 'SYNC_RESPONSE':
            if (msg.documentText) setCode(msg.documentText);
            break;
          case 'EDIT':
            // In a full impl, apply CRDT op to local doc
            break;
          case 'USER_JOINED':
            setOnlineUsers(prev => [...new Set([...prev, msg.username])]);
            break;
          case 'USER_LEFT':
            setOnlineUsers(prev => prev.filter(u => u !== msg.username));
            break;
          case 'CURSOR_MOVE':
            // Cursor position rendering handled by Monaco decorations
            break;
        }
      } catch (e) {
        console.error('WS message parse error', e);
      }
    };

    ws.onclose = () => console.log('WebSocket closed');
    ws.onerror = (e) => console.error('WebSocket error', e);

    wsRef.current = ws;
  }, [token, roomCode]);

  const handleCodeChange = (value) => {
    setCode(value || '');
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'EDIT',
        roomCode,
        siteId: user?.email,
        documentText: value,
      }));
    }
  };

  const handleRun = async () => {
    setExecuting(true);
    setShowOutput(true);
    setExecResult(null);
    try {
      const result = await execApi.run({ code, language, stdin });
      setExecResult(result);
    } catch (err) {
      setExecResult({ stderr: err.message, success: false, exitCode: -1 });
    } finally {
      setExecuting(false);
    }
  };

  const handleAi = async (type) => {
    setAiLoading(true);
    setShowAi(true);
    setAiResult(null);
    try {
      const fn = { review: aiApi.review, bugs: aiApi.bugs, complexity: aiApi.complexity, hint: aiApi.hint }[type];
      const result = await fn({ code, language });
      setAiResult(result);
    } catch (err) {
      setAiResult({ analysis: 'Error: ' + err.message, type });
    } finally {
      setAiLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="room">
      {/* Top bar */}
      <div className="room-topbar">
        <div className="room-topbar-left">
          <button className="btn-icon" onClick={() => navigate('/dashboard')} title="Back to Dashboard">
            <ArrowLeft size={18} />
          </button>
          <div className="room-topbar-info">
            <h2>{room?.name || 'Room'}</h2>
            <div className="room-topbar-code" onClick={copyCode}>
              <Hash size={12} />
              <span>{roomCode}</span>
              {copied ? <Check size={12} className="copy-check" /> : <Copy size={12} />}
            </div>
          </div>
        </div>
        <div className="room-topbar-center">
          <select
            className="lang-select"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              setCode(LANG_DEFAULTS[e.target.value] || '');
            }}
          >
            <option value="java">Java</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        <div className="room-topbar-right">
          <button className="btn-run" onClick={handleRun} disabled={executing}>
            {executing ? <Loader2 size={16} className="spin" /> : <Play size={16} />}
            {executing ? 'Running...' : 'Run'}
          </button>
          <div className="ai-buttons">
            <button className="btn-ai" onClick={() => handleAi('review')} title="Code Review">
              <FileSearch size={16} />
            </button>
            <button className="btn-ai" onClick={() => handleAi('bugs')} title="Bug Detection">
              <Bug size={16} />
            </button>
            <button className="btn-ai" onClick={() => handleAi('complexity')} title="Complexity Analysis">
              <BarChart3 size={16} />
            </button>
            <button className="btn-ai" onClick={() => handleAi('hint')} title="Get Hint">
              <Lightbulb size={16} />
            </button>
          </div>
          <button
            className={`btn-icon ${showMembers ? 'active' : ''}`}
            onClick={() => setShowMembers(!showMembers)}
            title="Toggle members"
          >
            <Users size={18} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="room-body">
        {/* Editor */}
        <div className="editor-area">
          <div className="editor-container">
            <Editor
              height="100%"
              language={LANG_MAP[language] || 'java'}
              value={code}
              onChange={handleCodeChange}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
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
              }}
            />
          </div>

          {/* Output panel */}
          {showOutput && (
            <div className="output-panel animate-slide-up">
              <div className="output-header">
                <div className="output-title">
                  <Terminal size={16} />
                  <span>Output</span>
                  {execResult && (
                    <span className={`output-status ${execResult.success ? 'success' : 'error'}`}>
                      {execResult.success ? '✓ Passed' : '✗ Failed'}
                      {execResult.executionTimeMs && ` (${execResult.executionTimeMs}ms)`}
                    </span>
                  )}
                </div>
                <button className="btn-icon" onClick={() => setShowOutput(false)}>
                  <X size={16} />
                </button>
              </div>
              <div className="output-body">
                {executing ? (
                  <div className="output-loading">
                    <Loader2 size={20} className="spin" />
                    <span>Executing...</span>
                  </div>
                ) : execResult ? (
                  <>
                    {execResult.stdout && (
                      <pre className="output-stdout">{execResult.stdout}</pre>
                    )}
                    {execResult.stderr && (
                      <pre className="output-stderr">{execResult.stderr}</pre>
                    )}
                    {execResult.timedOut && (
                      <pre className="output-stderr">⏱ Execution timed out</pre>
                    )}
                    {!execResult.stdout && !execResult.stderr && !execResult.timedOut && (
                      <pre className="output-stdout">(No output)</pre>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>

        {/* Right panels */}
        <div className={`room-sidebar ${showMembers || showAi ? 'open' : ''}`}>
          {/* Members panel */}
          {showMembers && (
            <div className="sidebar-panel members-panel">
              <div className="sidebar-panel-header">
                <h3><Users size={16} /> Members</h3>
                <span className="member-count">{room?.currentMembers || 0}</span>
              </div>
              <div className="members-list">
                {room?.members?.map((m) => (
                  <div key={m.userId} className="member-item">
                    <div
                      className="member-avatar"
                      style={{ background: m.role === 'OWNER' ? 'var(--gradient-primary)' : 'var(--bg-input)' }}
                    >
                      {m.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="member-info">
                      <span className="member-name">
                        {m.username}
                        {m.email === user?.email && ' (you)'}
                      </span>
                      <span className="member-role">{m.role}</span>
                    </div>
                    <div className={`member-status ${onlineUsers.includes(m.email) || m.email === user?.email ? 'online' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI panel */}
          {showAi && (
            <div className="sidebar-panel ai-panel animate-slide-up">
              <div className="sidebar-panel-header">
                <h3><Bot size={16} /> AI Assistant</h3>
                <button className="btn-icon" onClick={() => setShowAi(false)}>
                  <X size={14} />
                </button>
              </div>
              <div className="ai-body">
                {aiLoading ? (
                  <div className="ai-loading">
                    <Loader2 size={24} className="spin" />
                    <span>Analyzing your code...</span>
                  </div>
                ) : aiResult ? (
                  <div className="ai-result">
                    <div className="ai-result-type">
                      {aiResult.type === 'review' && <><FileSearch size={14} /> Code Review</>}
                      {aiResult.type === 'bugs' && <><Bug size={14} /> Bug Detection</>}
                      {aiResult.type === 'complexity' && <><BarChart3 size={14} /> Complexity Analysis</>}
                      {aiResult.type === 'hint' && <><Lightbulb size={14} /> Hint</>}
                    </div>
                    <div className="ai-result-content">
                      {aiResult.analysis}
                    </div>
                    {aiResult.processingTimeMs && (
                      <div className="ai-result-time">
                        Processed in {aiResult.processingTimeMs}ms
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
