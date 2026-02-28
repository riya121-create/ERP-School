import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

/* =====================================================
   ADMIN — ATTENDANCE OVERVIEW (DASHBOARD)
   /admin/attendance
===================================================== */
export const adminAttendanceOverview = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const totalStudents = await User.countDocuments({
      role: "student",
      academicStatus: "active",
    });

    const stats = await Attendance.aggregate([
      { $match: { date: today } },
      {
        $group: {
          _id: null,
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
          },
          classes: { $addToSet: "$classId" }
        }
      }
    ]);

    const result = stats[0] || {
      present: 0,
      absent: 0,
      classes: []
    };

    res.json({
      date: today,
      totalStudents,
      present: result.present,
      absent: result.absent,
      classesMarked: result.classes.length,
      attendancePercent:
        totalStudents === 0
          ? 0
          : Math.round((result.present / totalStudents) * 100),
    });
  } catch (err) {
    console.error("ADMIN ATTENDANCE OVERVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to load overview" });
  }
};


/* =====================================================
   ADMIN — ATTENDANCE BY CLASS
   /admin/attendance/classes?date=YYYY-MM-DD
===================================================== */
export const adminAttendanceByClass = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    const data = await Attendance.aggregate([
      { $match: { date } },
      {
        $group: {
          _id: "$classId",
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "class",
        },
      },
      { $unwind: "$class" },
      {
        $project: {
          _id: 0,
          classId: "$class._id",
          className: "$class.name",
          section: "$class.section",
          present: 1,
          absent: 1,
          total: { $add: ["$present", "$absent"] },
        },
      },
      { $sort: { className: 1 } },
    ]);

    res.json(data);
  } catch (err) {
    console.error("ADMIN ATTENDANCE BY CLASS ERROR:", err);
    res.status(500).json({ message: "Failed to load class attendance" });
  }
};

/* =====================================================
   ADMIN — ATTENDANCE BY STUDENT
   /admin/attendance/students?studentId=xxx
===================================================== */
export const adminAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId" });
    }

    const records = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId),
    })
      .populate("classId", "name section")
      .populate("teacherId", "name")
      .sort({ date: 1 })
      .select("date status markedAt classId teacherId");

    res.json(records);
  } catch (err) {
    console.error("ADMIN ATTENDANCE BY STUDENT ERROR:", err);
    res.status(500).json({ message: "Failed to load student attendance" });
  }
};

/* =====================================================
   ADMIN — ATTENDANCE AUDIT LOGS
   /admin/attendance/logs?from=YYYY-MM-DD&to=YYYY-MM-DD
===================================================== */
export const adminAttendanceLogs = async (req, res) => {
  try {
    const { from, to } = req.query;

    const filter = {};
    if (from && to) {
      filter.date = { $gte: from, $lte: to };
    }

    const logs = await Attendance.find(filter)
      .populate("studentId", "name rollNo")
      .populate("teacherId", "name")
      .populate("classId", "name section")
      .sort({ markedAt: -1 })
      .limit(500); // 🔐 safety limit

    res.json(logs);
  } catch (err) {
    console.error("ADMIN ATTENDANCE LOG ERROR:", err);
    res.status(500).json({ message: "Failed to load logs" });
  }
};
