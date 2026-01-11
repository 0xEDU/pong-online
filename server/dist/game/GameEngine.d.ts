import { GameState } from '../types/game.js';
export declare class GameEngine {
    private state;
    private player1Direction;
    private player2Direction;
    constructor();
    private createInitialState;
    private createBall;
    getState(): GameState;
    startGame(): void;
    setPlayerDirection(player: 1 | 2, direction: 'up' | 'down' | 'stop'): void;
    update(): void;
    private updatePaddle;
    private updateBall;
    private checkPaddleCollision;
    private increaseSpeed;
    private checkScoring;
    private resetBall;
    private checkWinner;
    reset(): void;
}
//# sourceMappingURL=GameEngine.d.ts.map