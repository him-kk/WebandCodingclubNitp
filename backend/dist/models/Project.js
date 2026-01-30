"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const projectSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    image: {
        type: String,
        default: null,
    },
    techStack: [{
            type: String,
            required: true,
        }],
    githubUrl: {
        type: String,
        required: [true, 'GitHub URL is required'],
        match: [/^https?:\/\/github\.com\/.+/, 'Please provide a valid GitHub URL'],
    },
    liveUrl: String,
    category: {
        type: String,
        enum: ['web', 'mobile', 'ai', 'security', 'devops', 'other'],
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner',
    },
    stars: {
        type: Number,
        default: 0,
    },
    forks: {
        type: Number,
        default: 0,
    },
    contributors: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    lead: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['planning', 'development', 'completed', 'archived'],
        default: 'planning',
    },
    tags: [String],
    points: {
        type: Number,
        default: 50,
    },
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ difficulty: 1 });
exports.default = mongoose_1.default.model('Project', projectSchema);
//# sourceMappingURL=Project.js.map