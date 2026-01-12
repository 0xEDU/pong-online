"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const ws_1 = require("ws");
const GameRoom_js_1 = require("./game/GameRoom.js");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const wss = new ws_1.WebSocketServer({ server, path: '/ws' });
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Room management
const rooms = new Map();
const playerRooms = new Map();
// Generate random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}
// Send message to client
function send(ws, message) {
    if (ws.readyState === ws_1.WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}
// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    ws.on('message', (data) => {
        try {
            const message = JSON.parse(data.toString());
            handleMessage(ws, message);
        }
        catch (error) {
            console.error('Failed to parse message:', error);
            send(ws, { type: 'ERROR', message: 'Invalid message format' });
        }
    });
    ws.on('close', () => {
        console.log('Client disconnected');
        handleDisconnect(ws);
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        handleDisconnect(ws);
    });
});
function handleMessage(ws, message) {
    switch (message.type) {
        case 'CREATE_ROOM':
            handleCreateRoom(ws);
            break;
        case 'JOIN_ROOM':
            handleJoinRoom(ws, message.roomId);
            break;
        case 'PADDLE_MOVE':
        case 'PLAYER_READY':
            handleGameMessage(ws, message);
            break;
        default:
            send(ws, { type: 'ERROR', message: 'Unknown message type' });
    }
}
function handleCreateRoom(ws) {
    // Check if player is already in a room
    if (playerRooms.has(ws)) {
        send(ws, { type: 'ERROR', message: 'Already in a room' });
        return;
    }
    // Generate unique room ID
    let roomId = generateRoomId();
    while (rooms.has(roomId)) {
        roomId = generateRoomId();
    }
    // Create room and add player
    const room = new GameRoom_js_1.GameRoom(roomId);
    const playerNumber = room.addPlayer(ws);
    if (playerNumber === null) {
        send(ws, { type: 'ERROR', message: 'Failed to create room' });
        return;
    }
    rooms.set(roomId, room);
    playerRooms.set(ws, roomId);
    console.log(`Room ${roomId} created by player ${playerNumber}`);
    send(ws, { type: 'ROOM_CREATED', roomId });
    send(ws, { type: 'ROOM_JOINED', roomId, playerNumber });
    send(ws, { type: 'WAITING_FOR_PLAYER' });
}
function handleJoinRoom(ws, roomId) {
    // Check if player is already in a room
    if (playerRooms.has(ws)) {
        send(ws, { type: 'ERROR', message: 'Already in a room' });
        return;
    }
    const room = rooms.get(roomId.toUpperCase());
    if (!room) {
        send(ws, { type: 'ERROR', message: 'Room not found' });
        return;
    }
    if (room.isFull()) {
        send(ws, { type: 'ERROR', message: 'Room is full' });
        return;
    }
    const playerNumber = room.addPlayer(ws);
    if (playerNumber === null) {
        send(ws, { type: 'ERROR', message: 'Failed to join room' });
        return;
    }
    playerRooms.set(ws, room.id);
    console.log(`Player ${playerNumber} joined room ${room.id}`);
    send(ws, { type: 'ROOM_JOINED', roomId: room.id, playerNumber });
    room.notifyPlayerJoined();
}
function handleGameMessage(ws, message) {
    const roomId = playerRooms.get(ws);
    if (!roomId) {
        send(ws, { type: 'ERROR', message: 'Not in a room' });
        return;
    }
    const room = rooms.get(roomId);
    if (!room) {
        send(ws, { type: 'ERROR', message: 'Room not found' });
        return;
    }
    room.handleMessage(ws, message);
}
function handleDisconnect(ws) {
    const roomId = playerRooms.get(ws);
    if (roomId) {
        const room = rooms.get(roomId);
        if (room) {
            // Get all players BEFORE removing the disconnecting player
            const allPlayerWs = room.getPlayerWebSockets();
            room.removePlayer(ws);
            // Clean up room if empty, OR clean up remaining player mappings
            if (room.isEmpty()) {
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted (empty)`);
            }
            else {
                // Room still has players but they're being kicked to lobby
                // Clean up their playerRooms mapping so they can create/join new rooms
                for (const playerWs of allPlayerWs) {
                    if (playerWs !== ws) {
                        playerRooms.delete(playerWs);
                        console.log(`Cleaned up playerRooms mapping for remaining player in room ${roomId}`);
                    }
                }
                // Delete the room since the game can't continue with one player
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted (opponent disconnected)`);
            }
        }
        playerRooms.delete(ws);
    }
}
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', rooms: rooms.size });
});
// Start server
const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
server.listen(Number(PORT), HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`WebSocket endpoint: ws://${HOST}:${PORT}/ws`);
});
//# sourceMappingURL=index.js.map