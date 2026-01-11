interface GameOverProps {
  winner: 1 | 2;
  playerNumber: 1 | 2;
  onPlayAgain: () => void;
}

export function GameOver({ winner, playerNumber, onPlayAgain }: GameOverProps) {
  const isWinner = winner === playerNumber;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className={`text-6xl font-bold mb-8 ${isWinner ? 'text-green-400' : 'text-red-400'}`}>
        {isWinner ? 'YOU WIN!' : 'YOU LOSE'}
      </div>
      
      <div className="text-2xl mb-8 text-gray-400">
        Player {winner} wins the game!
      </div>

      <button
        onClick={onPlayAgain}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold rounded-lg transition-colors"
      >
        Play Again
      </button>
    </div>
  );
}
