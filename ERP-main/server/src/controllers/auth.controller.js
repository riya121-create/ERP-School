import TeacherSession from "../models/TeacherSession.js";

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/* =========================
   LOGIN (ROLE LOCKED)
========================= */
export const login = async (req, res) => {
  try {
    let { email, password, intendedRole } = req.body;

    // 🛑 Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    // 🔽 normalize role
    if (intendedRole) {
      intendedRole = intendedRole.toLowerCase();
    }

    let user;

    /* =========================
       🎓 STUDENT LOGIN (FIX)
       → admissionNo OR rollNo
    ========================= */
    if (intendedRole === "student") {
      user = await User.findOne({
        role: "student",
        $or: [
          { email },
          { admissionNo: email },
          { rollNo: email }
        ]
      });
    }

    /* =========================
       ADMIN / TEACHER / PARENT
       (FIXED - ADD ROLE FILTER)
    ========================= */
    else {
      user = await User.findOne({
        role: intendedRole,
        $or: [
          { email },
          { phone: email }
        ]
      });
    }

    // ❌ user not found
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ inactive account
    if (!user.isActive) {
      return res.status(403).json({ message: "Account disabled" });
    }

    // 🔐 HARD ROLE LOCK
    if (intendedRole && user.role !== intendedRole) {
      return res.status(403).json({
        message: `Access denied. This login is for ${intendedRole.toUpperCase()} only.`
      });
    }

    // 🔑 Password verify
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🎟 JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );



let sessionToken = null;

// 🟢 CREATE SESSION ONLY FOR TEACHER
if (user.role === "teacher") {
  sessionToken = crypto.randomBytes(32).toString("hex");

  await TeacherSession.create({
    teacherId: user._id,
    sessionToken,              
    ipAddress: req.ip,
    device: req.headers["user-agent"],
    status: "ACTIVE"
  });
}


    // 🔁 force password change (teacher / parent only)
    const forcePasswordChange =
      (user.role === "teacher" || user.role === "parent") &&
      !user.isPasswordChanged;

  
   res.json({
  token,
  role: user.role,
  forcePasswordChange,
  sessionToken // ✅ frontend ko ye chahiye
});


  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* =========================
   CHANGE PASSWORD (UNCHANGED)
========================= */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    const strong =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!strong.test(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars, include uppercase, lowercase, number & special character"
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await User.findByIdAndUpdate(userId, {
      password: hashed,
      isPasswordChanged: true,
      passwordChangedAt: new Date()
    });

    res.json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
