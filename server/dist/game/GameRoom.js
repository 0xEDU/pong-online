"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
const ws_1 = require("ws");
const GameEngine_js_1 = require("./GameEngine.js");
class GameRoom {
    constructor(id) {
        this.players = new Map();
        this.gameLoop = null;
        this.TICK_RATE = 1000 / 60; // 60 FPS
        this.id = id;
        this.engine = new GameEngine_js_1.GameEngine();
    }
    addPlayer(ws) {
        if (this.players.size >= 2) {
            return null;
        }
        const playerNumber = this.players.size === 0 ? 1 : 2;
        this.players.set(ws, { ws, playerNumber, ready: false });
        return playerNumber;
    }
    removePlayer(ws) {
        const player = this.players.get(ws);
        if (player) {
            this.players.delete(ws);
            this.stopGame();
            // Notify remaining player
            this.broadcast({ type: 'PLAYER_DISCONNECTED' });
        }
    }
    getPlayerCount() {
        return this.players.size;
    }
    handleMessage(ws, message) {
        const player = this.players.get(ws);
        if (!player)
            return;
        switch (message.type) {
            case 'PLAYER_READY':
                this.handlePlayerReady(player);
                break;
            case 'PADDLE_MOVE':
                this.handlePaddleMove(player, message.direction);
                break;
        }
    }
    handlePlayerReady(player) {
        player.ready = true;
        console.log(`Player ${player.playerNumber} is ready`);
        // Notify all players that this player is ready
        this.broadcast({ type: 'PLAYER_READY_ACK', playerNumber: player.playerNumber });
        // Check if both players are ready
        const allReady = Array.from(this.players.values()).every(p => p.ready);
        console.log(`All ready: ${allReady}, player count: ${this.players.size}`);
        if (this.players.size === 2 && allReady) {
            console.log('Starting game!');
            this.startGame();
        }
    }
    handlePaddleMove(player, direction) {
        this.engine.setPlayerDirection(player.playerNumber, direction);
    }
    startGame() {
        this.engine.startGame();
        this.broadcast({ type: 'GAME_START' });
        // Start game loop
        this.gameLoop = setInterval(() => {
            this.tick();
        }, this.TICK_RATE);
    }
    stopGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    tick() {
        this.engine.update();
        const state = this.engine.getState();
        this.broadcast({ type: 'GAME_STATE', state });
        // Check if game is over
        if (state.status === 'finished' && state.winner) {
            this.broadcast({ type: 'GAME_OVER', winner: state.winner });
            this.stopGame();
        }
    }
    broadcast(message) {
        const data = JSON.stringify(message);
        for (const player of this.players.values()) {
            if (player.ws.readyState === ws_1.WebSocket.OPEN) {
                player.ws.send(data);
            }
        }
    }
    send(ws, message) {
        if (ws.readyState === ws_1.WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }
    notifyPlayerJoined() {
        // Notify all players that someone joined - both should know about each other
        this.broadcast({ type: 'PLAYER_JOINED', playerNumber: 2 });
    }
    isEmpty() {
        return this.players.size === 0;
    }
    isFull() {
        return this.players.size >= 2;
    }
    getPlayerWebSockets() {
        return Array.from(this.players.keys());
    }
}
exports.GameRoom = GameRoom;
//# sourceMappingURL=GameRoom.js.map