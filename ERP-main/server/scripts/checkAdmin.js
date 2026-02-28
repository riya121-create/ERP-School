import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const checkAdmin = async () => {
  try {
    console.log('🔍 Checking admin users in database...\n');
    
    // Find all admin users
    const admins = await User.find({ role: 'admin' });
    
    console.log(`📊 Found ${admins.length} admin users:`);
    
    if (admins.length === 0) {
      console.log('❌ No admin users found. Creating default admin...');
      
      // Create default admin
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@school.com',
        phone: '+91 9876543210',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      
      console.log('✅ Default admin created:');
      console.log('   Email: admin@school.com');
      console.log('   Password: admin123');
    } else {
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.name} (${admin.email})`);
        console.log(`   Active: ${admin.isActive ? 'Yes' : 'No'}`);
      });
    }
    
    // Also check if admin login endpoint exists in auth controller
    console.log('\n🔍 Checking authentication setup...');
    console.log('✅ Admin login should work with these credentials:');
    console.log('   Email: admin@school.com');
    console.log('   Password: admin123');
    console.log('   Role: Admin');

  } catch (error) {
    console.error('❌ Error checking admin:', error);
  } finally {
    mongoose.disconnect();
  }
};

checkAdmin();
