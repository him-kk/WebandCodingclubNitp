"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToAll = exports.emitToRoom = exports.emitToUser = exports.setupSocketHandlers = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const redis_1 = require("../config/redis");
const setupSocketHandlers = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            const user = await User_1.default.findById(decoded.userId).select('name email role');
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.user = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
                name: user.name,
            };
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`🔌 User ${socket.user?.name} connected`);
        if (socket.user) {
            socket.join(`user:${socket.user.userId}`);
        }
        socket.on('chat:message', async (data) => {
            try {
                if (!socket.user)
                    return;
                const message = {
                    id: Date.now().toString(),
                    userId: socket.user.userId,
                    name: socket.user.name,
                    message: data.message,
                    timestamp: new Date(),
                };
                socket.broadcast.emit('chat:message', message);
                const room = data.room || 'global';
                const key = `chat:history:${room}`;
                const history = await redis_1.redis.getJSON(key) || [];
                history.push(message);
                if (history.length > 100) {
                    history.splice(0, history.length - 100);
                }
                await redis_1.redis.setJSON(key, history, 86400);
            }
            catch (error) {
                console.error('Socket chat message error:', error);
            }
        });
        socket.on('room:join', (roomName) => {
            socket.join(roomName);
            socket.emit('room:joined', roomName);
        });
        socket.on('room:leave', (roomName) => {
            socket.leave(roomName);
            socket.emit('room:left', roomName);
        });
        socket.on('chat:typing', (data) => {
            socket.broadcast.emit('chat:typing', {
                userId: socket.user?.userId,
                name: socket.user?.name,
                isTyping: data.isTyping,
            });
        });
        socket.on('notification:subscribe', (channels) => {
            if (Array.isArray(channels)) {
                channels.forEach(channel => {
                    socket.join(`notifications:${channel}`);
                });
            }
        });
        socket.on('leaderboard:subscribe', () => {
            socket.join('leaderboard:updates');
        });
        socket.on('project:subscribe', (projectId) => {
            socket.join(`project:${projectId}`);
        });
        socket.on('event:subscribe', (eventId) => {
            socket.join(`event:${eventId}`);
        });
        socket.on('disconnect', () => {
            console.log(`🔌 User ${socket.user?.name} disconnected`);
        });
    });
};
exports.setupSocketHandlers = setupSocketHandlers;
const emitToUser = (io, userId, event, data) => {
    io.to(`user:${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
const emitToRoom = (io, room, event, data) => {
    io.to(room).emit(event, data);
};
exports.emitToRoom = emitToRoom;
const emitToAll = (io, event, data) => {
    io.emit(event, data);
};
exports.emitToAll = emitToAll;
//# sourceMappingURL=handlers.js.map