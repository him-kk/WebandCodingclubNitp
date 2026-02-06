import mongoose from 'mongoose';
import dns from 'dns';

// Only load dotenv and set custom DNS in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  console.log(' Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGODB_URI exists:', !!mongoURI);

  if (!mongoURI) {
    console.error(' MONGODB_URI is not defined');
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(mongoURI, {
      family: 4, // Force IPv4
    });
    console.log(' MongoDB connected successfully');
  } catch (error) {
    console.error(' MongoDB connection error:', error);
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log(' Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(' Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log(' Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log(' MongoDB connection closed through app termination');
  process.exit(0);
});