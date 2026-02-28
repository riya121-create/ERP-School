import TeacherSession from "../models/TeacherSession.js";

export const teacherLogout = async (req, res) => {
  try {
    // 🔐 FAANG-style: session token from headers
    const sessionToken = req.headers["x-session-token"];

    if (!sessionToken) {
      return res.status(400).json({
        message: "Session token missing"
      });
    }

    // 🔍 Find ACTIVE session
    const session = await TeacherSession.findOne({
      sessionToken,
      status: "ACTIVE"
    });

    if (!session) {
      return res.status(404).json({
        message: "Active session not found or already logged out"
      });
    }

    // 🔥 Proper logout
    session.logoutAt = new Date();
    session.status = "LOGGED_OUT";
    session.logoutReason = "USER_LOGOUT";

    await session.save();

    return res.json({
      message: "Logged out successfully"
    });
  } catch (err) {
    console.error("Teacher logout error:", err);
    return res.status(500).json({
      message: "Logout failed"
    });
  }
};
