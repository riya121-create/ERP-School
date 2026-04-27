import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../src/models/User.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const checkTeacher = async () => {
  try {
    console.log("🔍 Checking teacher users in database...\n");

    // Find all teacher users
    const teachers = await User.find({ role: "teacher" });

    console.log(`📊 Found ${teachers.length} teacher users:`);

    if (teachers.length === 0) {
      console.log("❌ No teacher users found. Creating default teacher...");

      // Create default teacher
      const hashedPassword = await bcrypt.hash("teacher123", 10);
      const teacher = await User.create({
        name: "Demo Teacher",
        email: "teacher@school.com",
        phone: "+91 9876543211",
        password: hashedPassword,
        role: "teacher",
        isActive: true,
        isPasswordChanged: false,
      });

      console.log("✅ Default teacher created:");
      console.log("   Email: teacher@school.com");
      console.log("   Password: teacher123");
    } else {
      teachers.forEach((teacher, index) => {
        console.log(`${index + 1}. ${teacher.name} (${teacher.email})`);
        console.log(`   Active: ${teacher.isActive ? "Yes" : "No"}`);
        console.log(`   Password Changed: ${teacher.isPasswordChanged ? "Yes" : "No"}`);
      });
    }

    console.log("\n🔍 Teacher Login Information:");
    console.log("✅ Teacher login credentials:");
    console.log("   Email: teacher@school.com");
    console.log("   Password: teacher123");
    console.log("   Role: Teacher");
    console.log("\n📝 Login Steps:");
    console.log("1. Go to http://localhost:5173/login");
    console.log("2. Enter email: teacher@school.com");
    console.log("3. Enter password: teacher123");
    console.log("4. Select role: Teacher");
    console.log("5. Click Login");
  } catch (error) {
    console.error("❌ Error checking teacher:", error);
  } finally {
    mongoose.disconnect();
  }
};

checkTeacher();
