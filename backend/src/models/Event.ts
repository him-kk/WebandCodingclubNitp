import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  image: string;
  category: 'workshop' | 'hackathon' | 'competition' | 'meetup' | 'webinar';
  attendees: mongoose.Types.ObjectId[];
  maxAttendees: number;
  isOnline: boolean;
  onlineLink?: string;
  requirements?: string[];
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  points: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
  },
  image: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    enum: ['workshop', 'hackathon', 'competition', 'meetup', 'webinar'],
    required: true,
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  maxAttendees: {
    type: Number,
    default: 100,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  onlineLink: String,
  requirements: [String],
  tags: [String],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming',
  },
  points: {
    type: Number,
    default: 100,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);
