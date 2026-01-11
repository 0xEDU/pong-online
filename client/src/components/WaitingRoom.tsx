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
  opponentReady 
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
          You are <span className="font-bold text-blue-400">Player {playerNumber}</span>
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
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full mb-2 ${
            playerNumber === 1 
              ? (myReady ? 'bg-green-500' : 'bg-yellow-500') 
              : (opponentReady ? 'bg-green-500' : (opponentJoined ? 'bg-yellow-500' : 'bg-gray-600'))
          }`} />
          <span className="text-sm text-gray-400">Player 1</span>
          <span className="text-xs text-gray-500">
            {playerNumber === 1 ? (myReady ? 'Ready!' : 'You') : (opponentReady ? 'Ready!' : (opponentJoined ? 'Waiting...' : 'Not joined'))}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-6 h-6 rounded-full mb-2 ${
            playerNumber === 2 
              ? (myReady ? 'bg-green-500' : 'bg-yellow-500') 
              : (opponentReady ? 'bg-green-500' : (opponentJoined ? 'bg-yellow-500' : 'bg-gray-600'))
          }`} />
          <span className="text-sm text-gray-400">Player 2</span>
          <span className="text-xs text-gray-500">
            {playerNumber === 2 ? (myReady ? 'Ready!' : 'You') : (opponentReady ? 'Ready!' : (opponentJoined ? 'Waiting...' : 'Not joined'))}
          </span>
        </div>
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

      <div className="mt-8 text-gray-500 text-sm">
        Use W/S or Arrow Keys to move your paddle
      </div>
    </div>
  );
}
