"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const admin_1 = __importDefault(require("./routes/admin"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const events_1 = __importDefault(require("./routes/events"));
const projects_1 = __importDefault(require("./routes/projects"));
const team_1 = __importDefault(require("./routes/team"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const resources_1 = __importDefault(require("./routes/resources"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
const contact_1 = __importDefault(require("./routes/contact"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFound_1 = require("./middleware/notFound");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const handlers_1 = require("./socket/handlers");
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        credentials: true,
    },
});
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://localhost:5174', process.env.FRONTEND_URL || 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, compression_1.default)());
if (process.env.NODE_ENV === 'production') {
    app.use(express_1.default.static('public'));
}
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/events', events_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/team', team_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/resources', resources_1.default);
app.use('/api/chatbot', chatbot_1.default);
app.use('/api/contact', contact_1.default);
app.use('/api/admin', admin_1.default);
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Web and Coding Club API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});
app.use(notFound_1.notFound);
app.use(errorHandler_1.errorHandler);
(0, handlers_1.setupSocketHandlers)(io);
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        await (0, redis_1.connectRedis)();
        server.listen(PORT, () => {
            console.log(` Web and Coding Club Server running on port ${PORT}`);
            console.log(` Environment: ${process.env.NODE_ENV}`);
            console.log(` Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
        });
    }
    catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map