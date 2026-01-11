import { useState } from 'react';

interface LobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  isConnected: boolean;
  error: string | null;
}

export function Lobby({ onCreateRoom, onJoinRoom, isConnected, error }: LobbyProps) {
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'menu' | 'join'>('menu');

  const handleJoin = () => {
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase());
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-2xl mb-4">Connecting to server...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-6xl font-bold mb-12 text-green-400">PONG</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded mb-6">
          {error}
        </div>
      )}

      {mode === 'menu' ? (
        <div className="flex flex-col gap-4">
          <button
            onClick={onCreateRoom}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-lg transition-colors"
          >
            Create Game
          </button>
          <button
            onClick={() => setMode('join')}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg transition-colors"
          >
            Join Game
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4 items-center">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Enter Room Code"
            maxLength={6}
            className="px-4 py-3 text-2xl text-center bg-gray-800 border-2 border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none uppercase tracking-widest w-48"
          />
          <div className="flex gap-4">
            <button
              onClick={() => setMode('menu')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleJoin}
              disabled={!roomCode.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      )}

      <div className="mt-12 text-gray-500 text-sm">
        Use W/S or Arrow Keys to move your paddle
      </div>
    </div>
  );
}
