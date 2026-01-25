// src/types/admin.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'member' | 'admin' | 'lead';
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
  lastLogin: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: Date | string;
  time: string;
  location: string;
  image?: string;
  category: 'workshop' | 'hackathon' | 'competition' | 'meetup' | 'webinar';
  attendees: string[];
  maxAttendees: number;
  isOnline: boolean;
  onlineLink?: string;
  requirements?: string[];
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  points: number;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  image?: string;
  techStack: string[];
  githubUrl: string;
  liveUrl?: string;
  category: 'web' | 'mobile' | 'ai' | 'security' | 'devops' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  stars: number;
  forks: number;
  contributors: string[];
  lead: string;
  status: 'planning' | 'development' | 'completed' | 'archived';
  tags: string[];
  points: number;
  createdBy: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Stats {
  totalUsers: number;
  totalEvents: number;
  totalProjects: number;
  activeUsers: number;
  upcomingEvents: number;
}

export type ActiveTab = 'dashboard' | 'events' | 'projects' | 'users';