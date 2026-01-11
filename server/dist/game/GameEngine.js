"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameEngine = void 0;
const game_js_1 = require("../types/game.js");
class GameEngine {
    constructor() {
        this.player1Direction = 'stop';
        this.player2Direction = 'stop';
        this.state = this.createInitialState();
    }
    createInitialState() {
        return {
            ball: this.createBall(),
            paddles: {
                player1: { y: game_js_1.CANVAS_HEIGHT / 2 - game_js_1.PADDLE_HEIGHT / 2, score: 0 },
                player2: { y: game_js_1.CANVAS_HEIGHT / 2 - game_js_1.PADDLE_HEIGHT / 2, score: 0 },
            },
            status: 'waiting',
        };
    }
    createBall() {
        // Random angle between -45 and 45 degrees
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        // Random direction (left or right)
        const direction = Math.random() > 0.5 ? 1 : -1;
        return {
            position: {
                x: game_js_1.CANVAS_WIDTH / 2,
                y: game_js_1.CANVAS_HEIGHT / 2,
            },
            velocity: {
                dx: Math.cos(angle) * game_js_1.BALL_SPEED * direction,
                dy: Math.sin(angle) * game_js_1.BALL_SPEED,
            },
        };
    }
    getState() {
        return this.state;
    }
    startGame() {
        this.state.status = 'playing';
        this.state.ball = this.createBall();
    }
    setPlayerDirection(player, direction) {
        if (player === 1) {
            this.player1Direction = direction;
        }
        else {
            this.player2Direction = direction;
        }
    }
    update() {
        if (this.state.status !== 'playing')
            return;
        // Update paddles
        this.updatePaddle(1, this.player1Direction);
        this.updatePaddle(2, this.player2Direction);
        // Update ball
        this.updateBall();
        // Check for scoring
        this.checkScoring();
        // Check for winner
        this.checkWinner();
    }
    updatePaddle(player, direction) {
        const paddle = player === 1 ? this.state.paddles.player1 : this.state.paddles.player2;
        if (direction === 'up') {
            paddle.y = Math.max(0, paddle.y - game_js_1.PADDLE_SPEED);
        }
        else if (direction === 'down') {
            paddle.y = Math.min(game_js_1.CANVAS_HEIGHT - game_js_1.PADDLE_HEIGHT, paddle.y + game_js_1.PADDLE_SPEED);
        }
    }
    updateBall() {
        const ball = this.state.ball;
        // Update position
        ball.position.x += ball.velocity.dx;
        ball.position.y += ball.velocity.dy;
        // Wall collision (top/bottom)
        if (ball.position.y <= 0 || ball.position.y >= game_js_1.CANVAS_HEIGHT - game_js_1.BALL_SIZE) {
            ball.velocity.dy = -ball.velocity.dy;
            // Clamp position
            ball.position.y = Math.max(0, Math.min(game_js_1.CANVAS_HEIGHT - game_js_1.BALL_SIZE, ball.position.y));
        }
        // Paddle collision
        this.checkPaddleCollision();
    }
    checkPaddleCollision() {
        const ball = this.state.ball;
        const { player1, player2 } = this.state.paddles;
        // Left paddle (player 1)
        if (ball.position.x <= game_js_1.PADDLE_WIDTH &&
            ball.position.y + game_js_1.BALL_SIZE >= player1.y &&
            ball.position.y <= player1.y + game_js_1.PADDLE_HEIGHT &&
            ball.velocity.dx < 0) {
            ball.velocity.dx = -ball.velocity.dx;
            ball.position.x = game_js_1.PADDLE_WIDTH;
            // Add spin based on where the ball hit the paddle
            const hitPosition = (ball.position.y + game_js_1.BALL_SIZE / 2 - player1.y) / game_js_1.PADDLE_HEIGHT;
            ball.velocity.dy = (hitPosition - 0.5) * game_js_1.BALL_SPEED * 2;
            // Increase speed slightly
            this.increaseSpeed();
        }
        // Right paddle (player 2)
        if (ball.position.x + game_js_1.BALL_SIZE >= game_js_1.CANVAS_WIDTH - game_js_1.PADDLE_WIDTH &&
            ball.position.y + game_js_1.BALL_SIZE >= player2.y &&
            ball.position.y <= player2.y + game_js_1.PADDLE_HEIGHT &&
            ball.velocity.dx > 0) {
            ball.velocity.dx = -ball.velocity.dx;
            ball.position.x = game_js_1.CANVAS_WIDTH - game_js_1.PADDLE_WIDTH - game_js_1.BALL_SIZE;
            // Add spin based on where the ball hit the paddle
            const hitPosition = (ball.position.y + game_js_1.BALL_SIZE / 2 - player2.y) / game_js_1.PADDLE_HEIGHT;
            ball.velocity.dy = (hitPosition - 0.5) * game_js_1.BALL_SPEED * 2;
            // Increase speed slightly
            this.increaseSpeed();
        }
    }
    increaseSpeed() {
        const ball = this.state.ball;
        const speedMultiplier = 1.05;
        const maxSpeed = game_js_1.BALL_SPEED * 2;
        const currentSpeed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2);
        if (currentSpeed < maxSpeed) {
            ball.velocity.dx *= speedMultiplier;
            ball.velocity.dy *= speedMultiplier;
        }
    }
    checkScoring() {
        const ball = this.state.ball;
        // Player 2 scores (ball went past left side)
        if (ball.position.x < 0) {
            this.state.paddles.player2.score++;
            this.resetBall(-1); // Ball goes toward player 1
        }
        // Player 1 scores (ball went past right side)
        if (ball.position.x > game_js_1.CANVAS_WIDTH) {
            this.state.paddles.player1.score++;
            this.resetBall(1); // Ball goes toward player 2
        }
    }
    resetBall(direction) {
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        this.state.ball = {
            position: {
                x: game_js_1.CANVAS_WIDTH / 2,
                y: game_js_1.CANVAS_HEIGHT / 2,
            },
            velocity: {
                dx: Math.cos(angle) * game_js_1.BALL_SPEED * direction,
                dy: Math.sin(angle) * game_js_1.BALL_SPEED,
            },
        };
    }
    checkWinner() {
        const { player1, player2 } = this.state.paddles;
        if (player1.score >= game_js_1.WINNING_SCORE) {
            this.state.status = 'finished';
            this.state.winner = 1;
        }
        else if (player2.score >= game_js_1.WINNING_SCORE) {
            this.state.status = 'finished';
            this.state.winner = 2;
        }
    }
    reset() {
        this.state = this.createInitialState();
        this.player1Direction = 'stop';
        this.player2Direction = 'stop';
    }
}
exports.GameEngine = GameEngine;
//# sourceMappingURL=GameEngine.js.map