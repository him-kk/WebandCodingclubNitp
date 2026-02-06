"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const status = err.status ?? 'error';
    if (err.code === 11000) {
        const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
        res.status(409).json({
            success: false,
            status,
            message: `${field} already exists`,
            field,
        });
        return;
    }
    if (err.name === 'ValidationError' && err instanceof Error) {
        const errors = Object.values(err.errors || {}).map((e) => e.message);
        res.status(400).json({
            success: false,
            status,
            message: 'Validation failed',
            errors,
        });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({
            success: false,
            status,
            message: 'Invalid data format',
        });
        return;
    }
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json({
            success: false,
            status,
            message: 'Invalid token',
        });
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json({
            success: false,
            status,
            message: 'Token expired',
        });
        return;
    }
    res.status(statusCode).json({
        success: false,
        status,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map