"use client";

import { GameInstructions } from "./GameInstructions";

interface PlayerStatusIndicatorProps {
  playerLabel: string;
  isCurrentPlayer: boolean;
  isReady: boolean;
  isJoined: boolean;
}

function PlayerStatusIndicator({
  playerLabel,
  isCurrentPlayer,
  isReady,
  isJoined,
}: PlayerStatusIndicatorProps) {
  const getStatusColor = () => {
    if (isCurrentPlayer) return isReady ? "bg-green-500" : "bg-yellow-500";
    if (isReady) return "bg-green-500";
    if (isJoined) return "bg-yellow-500";
    return "bg-gray-600";
  };

  const getStatusText = () => {
    if (isCurrentPlayer) return isReady ? "Ready!" : "You";
    if (isReady) return "Ready!";
    if (isJoined) return "Waiting...";
    return "Not joined";
  };

  return (
    <div className="flex flex-col items-center">
      <div className={`w-6 h-6 rounded-full mb-2 ${getStatusColor()}`} />
      <span className="text-sm text-gray-400">{playerLabel}</span>
      <span className="text-xs text-gray-500">{getStatusText()}</span>
    </div>
  );
}

interface WaitingRoomProps {
  roomId: string;
  playerNumber: 1 | 2;
  onReady: () => void;
  opponentJoined: boolean;
  myReady: boolean;
  opponentReady: boolean;
}

export function WaitingRoom({
  roomId,
  playerNumber,
  onReady,
  opponentJoined,
  myReady,
  opponentReady,
}: WaitingRoomProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h2 className="text-4xl font-bold mb-8 text-green-400">Waiting Room</h2>

      <div className="bg-gray-800 rounded-lg p-8 mb-8">
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm mb-2">Room Code</div>
          <div className="text-4xl font-mono font-bold tracking-widest text-yellow-400">
            {roomId}
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm">
          Share this code with your friend
        </div>
      </div>

      <div className="mb-8">
        <div className="text-lg mb-2">
          You are{" "}
          <span className="font-bold text-blue-400">Player {playerNumber}</span>
        </div>
        <div className="text-lg">
          {opponentJoined ? (
            <span className="text-green-400">Opponent has joined!</span>
          ) : (
            <span className="text-yellow-400">Waiting for opponent...</span>
          )}
        </div>
      </div>

      {/* Player status indicators */}
      <div className="flex gap-8 mb-8">
        <PlayerStatusIndicator
          playerLabel="Player 1"
          isCurrentPlayer={playerNumber === 1}
          isReady={playerNumber === 1 ? myReady : opponentReady}
          isJoined={playerNumber === 1 || opponentJoined}
        />
        <PlayerStatusIndicator
          playerLabel="Player 2"
          isCurrentPlayer={playerNumber === 2}
          isReady={playerNumber === 2 ? myReady : opponentReady}
          isJoined={playerNumber === 2 || opponentJoined}
        />
      </div>

      {opponentJoined && !myReady && (
        <button
          onClick={onReady}
          className="mt-4 px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-semibold rounded-lg transition-colors animate-pulse"
        >
          Ready to Play!
        </button>
      )}

      {myReady && !opponentReady && (
        <div className="mt-4 text-yellow-400 text-lg">
          Waiting for opponent to be ready...
        </div>
      )}

      <GameInstructions />
    </div>
  );
}
