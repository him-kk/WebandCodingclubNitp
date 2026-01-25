import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  image: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  category: 'web' | 'mobile' | 'ai' | 'security' | 'devops' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stars: number;
  forks: number;
  contributors: mongoose.Types.ObjectId[];
  lead: mongoose.Types.ObjectId;
  status: 'planning' | 'development' | 'completed' | 'archived';
  tags: string[];
  points: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lead: {
    type: mongoose.Schema.Types.ObjectId,
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
projectSchema.index({ category: 1, status: 1 });
projectSchema.index({ difficulty: 1 });

export default mongoose.model<IProject>('Project', projectSchema);
