import { WebSocket } from 'ws';
import { ServerMessage, ClientMessage } from '../types/game.js';
export declare class GameRoom {
    readonly id: string;
    private players;
    private engine;
    private gameLoop;
    private readonly TICK_RATE;
    constructor(id: string);
    addPlayer(ws: WebSocket): 1 | 2 | null;
    removePlayer(ws: WebSocket): void;
    getPlayerCount(): number;
    handleMessage(ws: WebSocket, message: ClientMessage): void;
    private handlePlayerReady;
    private handlePaddleMove;
    private startGame;
    private stopGame;
    private tick;
    private broadcast;
    send(ws: WebSocket, message: ServerMessage): void;
    notifyPlayerJoined(): void;
    isEmpty(): boolean;
    isFull(): boolean;
}
//# sourceMappingURL=GameRoom.d.ts.map