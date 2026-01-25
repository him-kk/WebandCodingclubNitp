import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: 'member' | 'Coordinator' | 'admin' | 'President' | 'lead'; // Added member and lead
  points: number;
  level: string;
  badges: string[];
  streak: number;
  github?: string;
  linkedin?: string;
  twitter?: string;
  bio?: string;
  skills: string[];
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLevel(): void;
  addPoints(points: number): void;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['member', 'Coordinator', 'admin', 'President', 'lead'], // Fixed: added 'member' and 'lead'
    default: 'member', // Now this matches the enum
  },
  points: {
    type: Number,
    default: 0,
  },
  level: {
    type: String,
    default: 'Beginner',
  },
  badges: [{
    type: String,
  }],
  streak: {
    type: Number,
    default: 0,
  },
  github: String,
  linkedin: String,
  twitter: String,
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  skills: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update level based on points
userSchema.methods.updateLevel = function(): void {
  const points = this.points;
  if (points >= 10000) {
    this.level = 'Grandmaster';
  } else if (points >= 7500) {
    this.level = 'Expert';
  } else if (points >= 5000) {
    this.level = 'Advanced';
  } else if (points >= 2500) {
    this.level = 'Intermediate';
  } else {
    this.level = 'Beginner';
  }
};

// Add points and update level
userSchema.methods.addPoints = function(points: number): void {
  this.points += points;
  this.updateLevel();
};

export default mongoose.model<IUser>('User', userSchema);