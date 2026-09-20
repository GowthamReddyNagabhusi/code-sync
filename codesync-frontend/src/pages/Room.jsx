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
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeSync!");\n    }\n}`,
  python: `def main():\n    print("Hello, CodeSync!")\n\nif __name__ == "__main__":\n    main()`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeSync!" << endl;\n    return 0;\n}`,
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
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(true);

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

  const handleTriggerAiAnalysis = useCallback((category) => {
    setShowAiPanel(true);
    requestAnalysis(category, sourceCode, selectedLanguage);
  }, [requestAnalysis, sourceCode, selectedLanguage]);

  const handleEditorMount = useCallback((editorInstance) => {
    editorInstanceRef.current = editorInstance;
  }, []);

  if (isLoadingRoom) {
    return <LoadingSpinner message="Entering collaborative room..." />;
  }

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
        onTriggerAiAnalysis={handleTriggerAiAnalysis}
        showMembersPanel={showMembersPanel}
        onToggleMembersPanel={() => setShowMembersPanel((prev) => !prev)}
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

        <aside className={`room-sidebar ${showMembersPanel || showAiPanel ? 'open' : ''}`}>
          {showMembersPanel && (
            <MemberListPanel
              members={roomMetadata?.members}
              activeCollaboratorEmails={activeCollaborators}
              currentUserEmail={currentUser?.email}
            />
          )}

          {showAiPanel && (
            <AiAssistantPanel
              isAnalyzing={isAnalyzing}
              aiResult={aiResult}
              onClose={() => {
                setShowAiPanel(false);
                clearAnalysis();
              }}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
