import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { roomApi } from '../services/api';
import {
  Code2, Plus, LogOut, Users, Clock, ArrowRight,
  Copy, Check, Hash, Trash2, DoorOpen
} from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [createForm, setCreateForm] = useState({ name: '', language: 'java', maxMembers: 5 });
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useEffect(() => { fetchRooms(); }, []);

  const fetchRooms = async () => {
    try {
      const data = await roomApi.list();
      setRooms(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const room = await roomApi.create(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', language: 'java', maxMembers: 5 });
      navigate(`/room/${room.roomCode}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await roomApi.join(joinCode.trim().toUpperCase());
      navigate(`/room/${joinCode.trim().toUpperCase()}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (roomCode) => {
    if (!confirm('Delete this room? This cannot be undone.')) return;
    try {
      await roomApi.delete(roomCode);
      setRooms(rooms.filter(r => r.roomCode !== roomCode));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeave = async (roomCode) => {
    try {
      await roomApi.leave(roomCode);
      setRooms(rooms.filter(r => r.roomCode !== roomCode));
    } catch (err) {
      setError(err.message);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const langColors = {
    java: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    python: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    cpp: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6' },
  };

  return (
    <div className="dashboard">
      <nav className="dash-nav">
        <div className="dash-nav-brand">
          <Code2 size={24} />
          <span className="gradient-text">CodeSync</span>
        </div>
        <div className="dash-nav-right">
          <div className="dash-user">
            <div className="dash-avatar">{user?.username?.[0]?.toUpperCase() || '?'}</div>
            <span>{user?.username}</span>
          </div>
          <button className="btn-icon" onClick={logout} title="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1>Your Rooms</h1>
            <p className="dash-subtitle">{rooms.length} active room{rooms.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="dash-header-actions">
            <button className="btn-secondary" onClick={() => { setShowJoin(true); setShowCreate(false); }}>
              <DoorOpen size={18} /> Join Room
            </button>
            <button className="btn-primary" onClick={() => { setShowCreate(true); setShowJoin(false); }}>
              <Plus size={18} /> Create Room
            </button>
          </div>
        </div>

        {error && <div className="dash-error">{error}</div>}

        {showCreate && (
          <div className="dash-modal animate-slide-up">
            <h3>Create a New Room</h3>
            <form onSubmit={handleCreate} className="modal-form">
              <input
                type="text"
                className="input-field"
                placeholder="Room name"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                required
                autoFocus
              />
              <div className="modal-row">
                <select
                  className="input-field"
                  value={createForm.language}
                  onChange={(e) => setCreateForm({ ...createForm, language: e.target.value })}
                >
                  <option value="java">Java</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
                <input
                  type="number"
                  className="input-field"
                  placeholder="Max members"
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
                  min={2}
                  max={10}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Room</button>
              </div>
            </form>
          </div>
        )}

        {showJoin && (
          <div className="dash-modal animate-slide-up">
            <h3>Join a Room</h3>
            <form onSubmit={handleJoin} className="modal-form">
              <input
                type="text"
                className="input-field"
                placeholder="Enter room code (e.g., A3X9K2M1)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={8}
                required
                autoFocus
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textAlign: 'center', fontSize: '1.2rem' }}
              />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowJoin(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Join Room</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="dash-loading">
            <div className="spinner" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="dash-empty animate-fade-in">
            <div className="dash-empty-icon"><Code2 size={48} /></div>
            <h3>No rooms yet</h3>
            <p>Create a new room or join one with a room code to start collaborating.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {rooms.map((room, i) => (
              <div
                key={room.id}
                className="room-card animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="room-card-header">
                  <h3 className="room-card-name">{room.name}</h3>
                  <span
                    className="room-lang-badge"
                    style={{
                      background: langColors[room.language]?.bg || langColors.java.bg,
                      color: langColors[room.language]?.color || langColors.java.color,
                    }}
                  >
                    {room.language}
                  </span>
                </div>

                <div className="room-card-code" onClick={() => copyCode(room.roomCode)}>
                  <Hash size={14} />
                  <span>{room.roomCode}</span>
                  {copied === room.roomCode ? <Check size={14} className="copy-check" /> : <Copy size={14} />}
                </div>

                <div className="room-card-meta">
                  <span><Users size={14} /> {room.currentMembers}/{room.maxMembers}</span>
                  <span><Clock size={14} /> {new Date(room.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="room-card-actions">
                  <button
                    className="btn-primary room-enter-btn"
                    onClick={() => navigate(`/room/${room.roomCode}`)}
                  >
                    Enter Room <ArrowRight size={16} />
                  </button>
                  {room.ownerUsername === user?.username ? (
                    <button className="btn-icon btn-danger-icon" onClick={() => handleDelete(room.roomCode)} title="Delete room">
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button className="btn-icon" onClick={() => handleLeave(room.roomCode)} title="Leave room">
                      <DoorOpen size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
