import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { roomService } from '../services/api';
import { useClipboard } from '../hooks/useClipboard';

import { DashboardNav } from '../components/dashboard/DashboardNav';
import { RoomCard } from '../components/dashboard/RoomCard';
import { CreateRoomModal } from '../components/dashboard/CreateRoomModal';
import { JoinRoomModal } from '../components/dashboard/JoinRoomModal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

import { Code2, Plus, DoorOpen } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeRooms, setActiveRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const { isCopied, copyToClipboard } = useClipboard();

  useEffect(() => {
    let isMounted = true;

    roomService
      .listRooms()
      .then((userRoomsList) => {
        if (isMounted) {
          setActiveRooms(userRoomsList);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setErrorMessage(requestError.message || 'Failed to load rooms');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingRooms(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateRoom = useCallback(async (newRoomConfig) => {
    setErrorMessage('');
    try {
      const createdRoom = await roomService.createRoom(newRoomConfig);
      setIsCreateModalOpen(false);
      navigate(`/room/${createdRoom.roomCode}`);
    } catch (creationError) {
      setErrorMessage(creationError.message || 'Failed to create room');
    }
  }, [navigate]);

  const handleJoinRoom = useCallback(async (targetRoomCode) => {
    setErrorMessage('');
    try {
      await roomService.joinRoom(targetRoomCode);
      setIsJoinModalOpen(false);
      navigate(`/room/${targetRoomCode}`);
    } catch (joinError) {
      setErrorMessage(joinError.message || 'Failed to join room');
    }
  }, [navigate]);

  const handleDeleteRoom = useCallback(async (targetRoomCode) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this room? This action cannot be undone.');
    if (!isConfirmed) return;

    try {
      await roomService.deleteRoom(targetRoomCode);
      setActiveRooms((prevRooms) => prevRooms.filter((room) => room.roomCode !== targetRoomCode));
    } catch (deleteError) {
      setErrorMessage(deleteError.message || 'Failed to delete room');
    }
  }, []);

  const handleLeaveRoom = useCallback(async (targetRoomCode) => {
    try {
      await roomService.leaveRoom(targetRoomCode);
      setActiveRooms((prevRooms) => prevRooms.filter((room) => room.roomCode !== targetRoomCode));
    } catch (leaveError) {
      setErrorMessage(leaveError.message || 'Failed to leave room');
    }
  }, []);

  return (
    <div className="dashboard">
      <DashboardNav
        username={currentUser?.username}
        onLogout={logout}
      />

      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1>Your Rooms</h1>
            <p className="dash-subtitle">
              {activeRooms.length} active room{activeRooms.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="dash-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setIsJoinModalOpen(true);
                setIsCreateModalOpen(false);
              }}
            >
              <DoorOpen size={18} /> Join Room
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setIsCreateModalOpen(true);
                setIsJoinModalOpen(false);
              }}
            >
              <Plus size={18} /> Create Room
            </button>
          </div>
        </header>

        {errorMessage && <div className="dash-error" role="alert">{errorMessage}</div>}

        <CreateRoomModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateRoom}
        />

        <JoinRoomModal
          isOpen={isJoinModalOpen}
          onClose={() => setIsJoinModalOpen(false)}
          onSubmit={handleJoinRoom}
        />

        {isLoadingRooms ? (
          <LoadingSpinner message="Loading your coding rooms..." />
        ) : activeRooms.length === 0 ? (
          <div className="dash-empty animate-fade-in">
            <div className="dash-empty-icon">
              <Code2 size={48} />
            </div>
            <h3>No rooms yet</h3>
            <p>Create a new room or join an existing session with an 8-character room code.</p>
          </div>
        ) : (
          <div className="rooms-grid">
            {activeRooms.map((roomItem, roomIndex) => (
              <RoomCard
                key={roomItem.id || roomItem.roomCode}
                room={roomItem}
                currentUsername={currentUser?.username}
                isCopied={isCopied(roomItem.roomCode)}
                onCopyRoomCode={copyToClipboard}
                onEnterRoom={(roomCode) => navigate(`/room/${roomCode}`)}
                onDeleteRoom={handleDeleteRoom}
                onLeaveRoom={handleLeaveRoom}
                animationIndex={roomIndex}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
