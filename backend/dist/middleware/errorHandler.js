"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return res.status(409).json({
            success: false,
            message: `${field} already exists`,
            field,
        });
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid data format',
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
        });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired',
        });
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map