import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { roomService } from '../services/api';
import { useClipboard } from '../hooks/useClipboard';
import { useCodeExecution } from '../hooks/useCodeExecution';
import { useAiAssistant } from '../hooks/useAiAssistant';
import { useWebSocketEditor } from '../hooks/useWebSocketEditor';

import { RoomHeader } from '../components/room/RoomHeader';
import { CodeEditor } from '../components/room/CodeEditor';
import { ExecutionPanel } from '../components/room/ExecutionPanel';
import { AiAssistantPanel } from '../components/room/AiAssistantPanel';
import { MemberListPanel } from '../components/room/MemberListPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

import './Room.css';

const DEFAULT_STARTER_CODE = {
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSync with Docker & Gemini AI!");\n    }\n}`,
  python: `def main():\n    print("Hello, CodeSync with Docker & Gemini AI!")\n\nif __name__ == "__main__":\n    main()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeSync with Docker & Gemini AI!" << endl;\n    return 0;\n}`,
};

export default function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, token: authToken } = useAuth();
  const editorInstanceRef = useRef(null);

  const [roomMetadata, setRoomMetadata] = useState(null);
  const [sourceCode, setSourceCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  const [showExecutionPanel, setShowExecutionPanel] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('ai'); // 'ai', 'members', or null
  const [activeAiCategory, setActiveAiCategory] = useState(null);

  const { isCopied, copyToClipboard } = useClipboard();
  const { isExecuting, executionResult, executeCode, clearExecution } = useCodeExecution();
  const { isAnalyzing, aiResult, requestAnalysis, clearAnalysis } = useAiAssistant();

  const handleRemoteDocumentUpdate = useCallback((newDocumentText) => {
    setSourceCode((currentCode) => (currentCode === newDocumentText ? currentCode : newDocumentText));
  }, []);

  const { activeCollaborators, broadcastEdit } = useWebSocketEditor({
    roomCode,
    token: authToken,
    currentUserEmail: currentUser?.email,
    onRemoteEdit: handleRemoteDocumentUpdate,
  });

  useEffect(() => {
    let isMounted = true;

    roomService
      .getRoomByCode(roomCode)
      .then((roomDetails) => {
        if (isMounted) {
          setRoomMetadata(roomDetails);
          setSelectedLanguage(roomDetails.language || 'java');
          setSourceCode(DEFAULT_STARTER_CODE[roomDetails.language] || DEFAULT_STARTER_CODE.java);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          console.error(`Failed to retrieve room session for code: ${roomCode}`, loadError);
          navigate('/dashboard');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRoom(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [roomCode, navigate]);

  const handleLocalCodeChange = useCallback((updatedValue) => {
    const nextCode = updatedValue || '';
    setSourceCode(nextCode);
    broadcastEdit(nextCode);
  }, [broadcastEdit]);

  const handleLanguageChange = useCallback((nextLanguage) => {
    setSelectedLanguage(nextLanguage);
    setSourceCode(DEFAULT_STARTER_CODE[nextLanguage] || '');
  }, []);

  const handleRunExecution = useCallback(() => {
    setShowExecutionPanel(true);
    executeCode(sourceCode, selectedLanguage);
  }, [executeCode, sourceCode, selectedLanguage]);

  const handleTriggerAiAnalysis = useCallback((category, customPrompt = '') => {
    setActiveSidebarTab('ai');
    setActiveAiCategory(category);
    requestAnalysis(category, sourceCode, selectedLanguage, customPrompt);
  }, [requestAnalysis, sourceCode, selectedLanguage]);

  const handleToggleSidebarTab = useCallback((tabName) => {
    setActiveSidebarTab((prevTab) => (prevTab === tabName ? null : tabName));
  }, []);

  const handleEditorMount = useCallback((editorInstance) => {
    editorInstanceRef.current = editorInstance;
  }, []);

  if (isLoadingRoom) {
    return <LoadingSpinner message="Entering collaborative room..." />;
  }

  const collaboratorCount = Math.max(1, activeCollaborators?.length || roomMetadata?.members?.length || 1);

  return (
    <div className="room">
      <RoomHeader
        roomName={roomMetadata?.name}
        roomCode={roomCode || ''}
        isCopied={isCopied(roomCode)}
        onCopyRoomCode={() => copyToClipboard(roomCode)}
        selectedLanguage={selectedLanguage}
        onLanguageChange={handleLanguageChange}
        isExecuting={isExecuting}
        onRunCode={handleRunExecution}
        activeSidebarTab={activeSidebarTab}
        onToggleSidebarTab={handleToggleSidebarTab}
        collaboratorCount={collaboratorCount}
        onNavigateBack={() => navigate('/dashboard')}
      />

      <div className="room-body">
        <main className="editor-area">
          <CodeEditor
            code={sourceCode}
            language={selectedLanguage}
            onCodeChange={handleLocalCodeChange}
            onEditorMount={handleEditorMount}
          />

          {showExecutionPanel && (
            <ExecutionPanel
              isExecuting={isExecuting}
              executionResult={executionResult}
              onClose={() => {
                setShowExecutionPanel(false);
                clearExecution();
              }}
            />
          )}
        </main>

        {activeSidebarTab && (
          <aside className="room-sidebar open animate-slide-in">
            {/* Sidebar Tab Switcher */}
            <div className="sidebar-tab-switcher">
              <button
                type="button"
                className={`sidebar-tab-btn ${activeSidebarTab === 'ai' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('ai')}
              >
                <span>✨ Gemini AI</span>
              </button>
              <button
                type="button"
                className={`sidebar-tab-btn ${activeSidebarTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveSidebarTab('members')}
              >
                <span>👥 Team ({collaboratorCount})</span>
              </button>
            </div>

            <div className="sidebar-content-view">
              {activeSidebarTab === 'ai' && (
                <AiAssistantPanel
                  isAnalyzing={isAnalyzing}
                  aiResult={aiResult}
                  activeCategory={activeAiCategory}
                  onTriggerAnalysis={handleTriggerAiAnalysis}
                  onClose={() => setActiveSidebarTab(null)}
                  onClear={clearAnalysis}
                />
              )}

              {activeSidebarTab === 'members' && (
                <MemberListPanel
                  members={roomMetadata?.members}
                  activeCollaboratorEmails={activeCollaborators}
                  currentUserEmail={currentUser?.email}
                />
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
