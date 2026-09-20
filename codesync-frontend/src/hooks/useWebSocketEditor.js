import { useState, useEffect, useRef, useCallback } from 'react';
import { getWebSocketEndpoint } from '../services/api';

/**
 * WebSocket collaboration hook for real-time document sync and presence.
 * 
 * @param {object} params
 * @param {string} params.roomCode - Unique 8-character room identifier
 * @param {string} params.token - Current user JWT
 * @param {string} params.currentUserEmail - Active user email (siteId for collision avoidance)
 * @param {function(string): void} params.onRemoteEdit - Callback when a remote document sync or edit is received
 */
export function useWebSocketEditor({ roomCode, token, currentUserEmail, onRemoteEdit }) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState([]);

  // Stable callback ref to prevent unnecessary socket reconnections
  const remoteEditCallbackRef = useRef(onRemoteEdit);
  useEffect(() => {
    remoteEditCallbackRef.current = onRemoteEdit;
  }, [onRemoteEdit]);

  useEffect(() => {
    if (!roomCode || !token) {
      return;
    }

    const socketEndpoint = getWebSocketEndpoint(roomCode, token);
    const socket = new WebSocket(socketEndpoint);

    socket.onopen = () => {
      setIsConnected(true);
      // Immediately request CRDT/RGA document snapshot
      socket.send(JSON.stringify({ type: 'SYNC_REQUEST', roomCode }));
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'SYNC_RESPONSE':
            if (message.documentText !== undefined && remoteEditCallbackRef.current) {
              remoteEditCallbackRef.current(message.documentText);
            }
            break;

          case 'EDIT':
            // Only apply remote changes from other clients
            if (message.documentText !== undefined && message.siteId !== currentUserEmail) {
              if (remoteEditCallbackRef.current) {
                remoteEditCallbackRef.current(message.documentText);
              }
            }
            break;

          case 'USER_JOINED':
            if (message.username) {
              setActiveCollaborators((prev) => Array.from(new Set([...prev, message.username])));
            }
            break;

          case 'USER_LEFT':
            if (message.username) {
              setActiveCollaborators((prev) => prev.filter((username) => username !== message.username));
            }
            break;

          case 'CURSOR_MOVE':
            // Monaco cursor decorations hook point
            break;

          default:
            break;
        }
      } catch (parseError) {
        console.error('Failed to parse incoming WebSocket message:', parseError);
      }
    };

    socket.onclose = () => {
      setIsConnected(false);
    };

    socket.onerror = (socketError) => {
      console.error('WebSocket connection encountered an error:', socketError);
    };

    socketRef.current = socket;

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [roomCode, token, currentUserEmail]);

  const broadcastEdit = useCallback((documentText) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'EDIT',
          roomCode,
          siteId: currentUserEmail,
          documentText,
        })
      );
    }
  }, [roomCode, currentUserEmail]);

  return {
    isConnected,
    activeCollaborators,
    broadcastEdit,
  };
}
