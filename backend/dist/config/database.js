"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const dns_1 = __importDefault(require("dns"));
dotenv_1.default.config();
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
        throw new Error('MONGODB_URI is not defined');
    }
    try {
        await mongoose_1.default.connect(mongoURI, {
            family: 4,
        });
        console.log('✅ MongoDB connected successfully');
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
mongoose_1.default.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected from MongoDB');
});
process.on('SIGINT', async () => {
    await mongoose_1.default.connection.close();
    console.log('👋 MongoDB connection closed through app termination');
    process.exit(0);
});
//# sourceMappingURL=database.js.map