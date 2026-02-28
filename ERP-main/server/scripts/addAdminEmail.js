import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const addAdminEmail = async () => {
  try {
    console.log('🔧 Adding admin@school.com to database...\n');
    
    // Check if admin@school.com already exists
    let admin = await User.findOne({ email: 'admin@school.com' });
    
    if (!admin) {
      // Create admin@school.com
      admin = await User.create({
        name: 'School Administrator',
        email: 'admin@school.com',
        phone: '+91 9876543210',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Admin created with email: admin@school.com');
    } else {
      console.log('✅ Admin already exists: admin@school.com');
    }
    
    // Also check the existing admin
    const existingAdmin = await User.findOne({ email: 'admin@echelonschool.com' });
    if (existingAdmin) {
      console.log('✅ Existing admin: admin@echelonschool.com');
    }
    
    console.log('\n📋 Admin Login Credentials:');
    console.log('1. Email: admin@school.com');
    console.log('   Password: admin123');
    console.log('2. Email: admin@echelonschool.com');
    console.log('   Password: admin123');
    
    console.log('\n🚀 Both admin emails should now work!');

  } catch (error) {
    console.error('❌ Error adding admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

addAdminEmail();
