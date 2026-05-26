const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...getHeaders(), ...options.headers }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Room APIs
export const roomApi = {
  create: (data) => request('/api/rooms', { method: 'POST', body: JSON.stringify(data) }),
  list: () => request('/api/rooms'),
  get: (code) => request(`/api/rooms/${code}`),
  join: (code) => request(`/api/rooms/${code}/join`, { method: 'POST' }),
  leave: (code) => request(`/api/rooms/${code}/leave`, { method: 'DELETE' }),
  delete: (code) => request(`/api/rooms/${code}`, { method: 'DELETE' }),
};

// Execution API
export const execApi = {
  run: (data) => request('/api/execute', { method: 'POST', body: JSON.stringify(data) }),
};

// AI API
export const aiApi = {
  review: (data) => request('/api/ai/review', { method: 'POST', body: JSON.stringify(data) }),
  bugs: (data) => request('/api/ai/bugs', { method: 'POST', body: JSON.stringify(data) }),
  complexity: (data) => request('/api/ai/complexity', { method: 'POST', body: JSON.stringify(data) }),
  hint: (data) => request('/api/ai/hint', { method: 'POST', body: JSON.stringify(data) }),
};
