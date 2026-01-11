import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { Game } from './components/Game';
import { GameOver } from './components/GameOver';
import { GameState, ServerMessage } from './types/game';

type AppState = 'lobby' | 'waiting' | 'playing' | 'gameover';

// Use the Vite dev server proxy or connect directly in production
const WS_URL = import.meta.env.DEV 
  ? `ws://${window.location.hostname}:3001/ws`
  : `ws://${window.location.host}/ws`;

function App() {
  const { status, send, subscribe } = useWebSocket(WS_URL);
  
  const [appState, setAppState] = useState<AppState>('lobby');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<1 | 2 | null>(null);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [myReady, setMyReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle server messages using subscription
  useEffect(() => {
    const unsubscribe = subscribe((message: ServerMessage) => {
      console.log('Processing message:', message.type, message);
      
      switch (message.type) {
        case 'ROOM_CREATED':
          setRoomId(message.roomId);
          break;

        case 'ROOM_JOINED':
          setRoomId(message.roomId);
          setPlayerNumber(message.playerNumber);
          setAppState('waiting');
          setError(null);
          // If joining as player 2, opponent (player 1) is already there
          if (message.playerNumber === 2) {
            setOpponentJoined(true);
          }
          break;

        case 'PLAYER_JOINED':
          setOpponentJoined(true);
          break;

        case 'PLAYER_READY_ACK':
          // Update ready state based on which player is ready
          setPlayerNumber(currentPlayerNumber => {
            if (message.playerNumber === currentPlayerNumber) {
              setMyReady(true);
            } else {
              setOpponentReady(true);
            }
            return currentPlayerNumber;
          });
          break;

        case 'WAITING_FOR_PLAYER':
          setOpponentJoined(false);
          break;

        case 'GAME_START':
          setAppState('playing');
          break;

        case 'GAME_STATE':
          setGameState(message.state);
          break;

        case 'GAME_OVER':
          setWinner(message.winner);
          setAppState('gameover');
          break;

        case 'PLAYER_DISCONNECTED':
          setError('Opponent disconnected');
          setAppState('lobby');
          setRoomId(null);
          setPlayerNumber(null);
          setOpponentJoined(false);
          setMyReady(false);
          setOpponentReady(false);
          setGameState(null);
          setWinner(null);
          break;

        case 'ERROR':
          setError(message.message);
          break;
      }
    });

    return unsubscribe;
  }, [subscribe]);

  const handleCreateRoom = useCallback(() => {
    setError(null);
    send({ type: 'CREATE_ROOM' });
  }, [send]);

  const handleJoinRoom = useCallback((code: string) => {
    setError(null);
    send({ type: 'JOIN_ROOM', roomId: code });
  }, [send]);

  const handleReady = useCallback(() => {
    console.log('Sending PLAYER_READY');
    send({ type: 'PLAYER_READY' });
  }, [send]);

  const handlePaddleMove = useCallback((direction: 'up' | 'down' | 'stop') => {
    send({ type: 'PADDLE_MOVE', direction });
  }, [send]);

  const handlePlayAgain = useCallback(() => {
    setRoomId(null);
    setPlayerNumber(null);
    setOpponentJoined(false);
    setMyReady(false);
    setOpponentReady(false);
    setGameState(null);
    setWinner(null);
    setAppState('lobby');
  }, []);

  // Render based on app state
  switch (appState) {
    case 'lobby':
      return (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isConnected={status === 'connected'}
          error={error}
        />
      );

    case 'waiting':
      if (!roomId || !playerNumber) return null;
      return (
        <WaitingRoom
          roomId={roomId}
          playerNumber={playerNumber}
          onReady={handleReady}
          opponentJoined={opponentJoined}
          myReady={myReady}
          opponentReady={opponentReady}
        />
      );

    case 'playing':
      if (!gameState || !playerNumber) return null;
      return (
        <Game
          gameState={gameState}
          playerNumber={playerNumber}
          onPaddleMove={handlePaddleMove}
        />
      );

    case 'gameover':
      if (!winner || !playerNumber) return null;
      return (
        <GameOver
          winner={winner}
          playerNumber={playerNumber}
          onPlayAgain={handlePlayAgain}
        />
      );

    default:
      return null;
  }
}

export default App;
