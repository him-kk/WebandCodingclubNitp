import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/web-coding-club');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@webcodingclub.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update to admin if not already
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(' User updated to admin role!');
      }
      process.exit(0);
    }

    // Create new admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@webcodingclub.com',
      password: 'admin123456', // This will be hashed automatically by your User model
      role: 'admin',
      points: 0,
      level: 1,
      badges: [],
      streak: 0,
      isActive: true,
    });

    await adminUser.save();

    console.log(' Admin user created successfully!');
    console.log('Email: admin@webcodingclub.com');
    console.log('Password: admin123456');
    console.log('  Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error(' Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();