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
const eventSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Please provide event title'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide event description'],
        trim: true,
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    date: {
        type: Date,
        required: [true, 'Please provide event date'],
    },
    time: {
        type: String,
        required: [true, 'Please provide event time'],
    },
    location: {
        type: String,
        required: [true, 'Please provide event location'],
    },
    image: {
        type: String,
        default: 'https://via.placeholder.com/400x300?text=Event+Image',
    },
    category: {
        type: String,
        enum: ['workshop', 'hackathon', 'competition', 'meetup', 'webinar'],
        default: 'workshop',
    },
    maxAttendees: {
        type: Number,
        default: 100,
        min: [1, 'Max attendees must be at least 1'],
    },
    attendees: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    points: {
        type: Number,
        default: 50,
        min: [0, 'Points cannot be negative'],
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    registrationLink: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Please provide a valid URL for registration link',
        },
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdBy: 1 });
exports.default = mongoose_1.default.model('Event', eventSchema);
//# sourceMappingURL=Event.js.map