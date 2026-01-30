"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const redis_1 = require("../config/redis");
const protect = async (req, res, next) => {
    try {
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'You are not logged in. Please log in to get access.',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const session = await redis_1.redis.getJSON(`session:${decoded.userId}`);
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Session expired. Please log in again.',
            });
        }
        const user = await User_1.default.findById(decoded.userId).select('+isActive');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'The user belonging to this token no longer exists.',
            });
        }
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'User account is deactivated.',
            });
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Please log in again.',
            });
        }
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'You are not logged in',
            });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action',
            });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
const optionalAuth = async (req, res, next) => {
    try {
        let token = null;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        if (token) {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map