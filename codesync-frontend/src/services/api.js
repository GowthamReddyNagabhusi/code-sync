/**
 * CodeSync API Client
 * Centralized HTTP request utility with token handling and structured error propagation.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Derives the WebSocket endpoint URL from the configured HTTP base URL.
 * Supports secure wss:// protocol for production HTTPS deployments.
 * 
 * @param {string} roomCode 
 * @param {string} token 
 * @returns {string} WebSocket URL
 */
export function getWebSocketEndpoint(roomCode, token) {
  const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss://' : 'ws://';
  const cleanHost = API_BASE_URL.replace(/^https?:\/\//, '');
  return `${wsProtocol}${cleanHost}/ws/editor?token=${encodeURIComponent(token || '')}&roomCode=${encodeURIComponent(roomCode)}`;
}

function getAuthorizationHeaders() {
  const authToken = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
  };
}

async function request(endpoint, options = {}) {
  const requestUrl = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(requestUrl, {
    ...options,
    headers: {
      ...getAuthorizationHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorPayload.message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// Room Management Service
export const roomService = {
  createRoom: (roomConfig) => request('/api/rooms', { method: 'POST', body: JSON.stringify(roomConfig) }),
  listRooms: () => request('/api/rooms'),
  getRoomByCode: (roomCode) => request(`/api/rooms/${roomCode}`),
  joinRoom: (roomCode) => request(`/api/rooms/${roomCode}/join`, { method: 'POST' }),
  leaveRoom: (roomCode) => request(`/api/rooms/${roomCode}/leave`, { method: 'DELETE' }),
  deleteRoom: (roomCode) => request(`/api/rooms/${roomCode}`, { method: 'DELETE' }),
};

// Aliases for backwards compatibility if needed
export const roomApi = {
  create: roomService.createRoom,
  list: roomService.listRooms,
  get: roomService.getRoomByCode,
  join: roomService.joinRoom,
  leave: roomService.leaveRoom,
  delete: roomService.deleteRoom,
};

// Code Execution Sandbox Service
export const executionService = {
  executeCode: (executionPayload) => request('/api/execute', { method: 'POST', body: JSON.stringify(executionPayload) }),
};

export const execApi = {
  run: executionService.executeCode,
};

// AI Assisted Engineering Service
export const aiAssistantService = {
  reviewCode: (payload) => request('/api/ai/review', { method: 'POST', body: JSON.stringify(payload) }),
  detectBugs: (payload) => request('/api/ai/bugs', { method: 'POST', body: JSON.stringify(payload) }),
  analyzeComplexity: (payload) => request('/api/ai/complexity', { method: 'POST', body: JSON.stringify(payload) }),
  generateHint: (payload) => request('/api/ai/hint', { method: 'POST', body: JSON.stringify(payload) }),
};

export const aiApi = {
  review: aiAssistantService.reviewCode,
  bugs: aiAssistantService.detectBugs,
  complexity: aiAssistantService.analyzeComplexity,
  hint: aiAssistantService.generateHint,
};
