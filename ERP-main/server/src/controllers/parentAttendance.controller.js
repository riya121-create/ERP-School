import Attendance from "../models/Attendance.js";
import User from "../models/User.js";

export const getChildAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 🔒 SECURITY CHECK
    const student = await User.findById(studentId);
    if (!student || student.parentPhone !== req.user.phone) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 📊 FETCH ATTENDANCE
    const attendance = await Attendance.find({
      studentId
    }).sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    console.error("PARENT ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};
