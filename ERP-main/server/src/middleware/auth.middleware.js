import jwt from "jsonwebtoken";
import User from "../models/User.js";
import TeacherSession from "../models/TeacherSession.js";

export const protect = (roles = []) => {
  // 🛡 ensure roles is always array
  if (!Array.isArray(roles)) roles = [roles];

  return async (req, res, next) => {
    try {
      /* ======================
         JWT EXTRACTION
      ====================== */
      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith("Bearer ")
          ? authHeader.split(" ")[1]
          : null;

      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({
          message:
            err.name === "TokenExpiredError"
              ? "Token expired"
              : "Invalid token",
        });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      /* ======================
         ROLE CHECK
      ====================== */
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      /* ======================
         TEACHER SESSION CHECK
      ====================== */
      if (user.role === "teacher") {
        const sessionToken = req.headers["x-session-token"];

        if (!sessionToken) {
          return res.status(401).json({
            message: "Session expired. Please login again.",
          });
        }

        const session = await TeacherSession.findOne({
          teacherId: user._id,
          sessionToken,
          status: "ACTIVE",
        });

        if (!session) {
          return res.status(401).json({
            message: "Session expired or logged out",
          });
        }

        // ⚡ Optimized heartbeat (1 min rule)
        const now = Date.now();
        if (!session.lastSeenAt || now - session.lastSeenAt.getTime() > 60_000) {
          session.lastSeenAt = new Date();
          await session.save();
        }
      }

      /* ======================
         ATTACH USER
      ====================== */
      req.user = user;
      next();
    } catch (err) {
      console.error("AUTH MIDDLEWARE ERROR:", err);
      return res.status(500).json({ message: "Authentication failed" });
    }
  };
};
