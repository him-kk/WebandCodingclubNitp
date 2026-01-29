// import mongoose, { Document, Schema } from 'mongoose';

// export interface IEvent extends Document {
//   title: string;
//   description: string;
//   date: Date;
//   time: string;
//   location: string;
//   image: string;
//   category: 'workshop' | 'hackathon' | 'competition' | 'meetup' | 'webinar';
//   attendees: mongoose.Types.ObjectId[];
//   maxAttendees: number;
//   isOnline: boolean;
//   onlineLink?: string;
//   requirements?: string[];
//   tags: string[];
//   status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
//   points: number;
//   createdBy: mongoose.Types.ObjectId;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const eventSchema = new Schema<IEvent>({
//   title: {
//     type: String,
//     required: [true, 'Event title is required'],
//     trim: true,
//     maxlength: [100, 'Title cannot exceed 100 characters'],
//   },
//   description: {
//     type: String,
//     required: [true, 'Event description is required'],
//     maxlength: [1000, 'Description cannot exceed 1000 characters'],
//   },
//   date: {
//     type: Date,
//     required: [true, 'Event date is required'],
//   },
//   time: {
//     type: String,
//     required: [true, 'Event time is required'],
//   },
//   location: {
//     type: String,
//     required: [true, 'Event location is required'],
//   },
//   image: {
//     type: String,
//     default: null,
//   },
//   category: {
//     type: String,
//     enum: ['workshop', 'hackathon', 'competition', 'meetup', 'webinar'],
//     required: true,
//   },
//   attendees: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//   }],
//   maxAttendees: {
//     type: Number,
//     default: 100,
//   },
//   isOnline: {
//     type: Boolean,
//     default: false,
//   },
//   onlineLink: String,
//   requirements: [String],
//   tags: [String],
//   status: {
//     type: String,
//     enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
//     default: 'upcoming',
//   },
//   points: {
//     type: Number,
//     default: 100,
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true,
//   },
// }, {
//   timestamps: true,
// });

// // Index for efficient queries
// eventSchema.index({ date: 1, status: 1 });
// eventSchema.index({ category: 1 });

// export default mongoose.model<IEvent>('Event', eventSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  image: string;
  category: 'workshop' | 'hackathon' | 'competition' | 'meetup' | 'webinar';
  maxAttendees: number;
  attendees: mongoose.Types.ObjectId[];
  points: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registrationLink?: string; // NEW FIELD
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
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
        type: Schema.Types.ObjectId,
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
        validator: function(v: string) {
          // If registration link is provided, validate it's a valid URL
          if (!v) return true; // Optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: 'Please provide a valid URL for registration link',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ createdBy: 1 });

export default mongoose.model<IEvent>('Event', eventSchema);