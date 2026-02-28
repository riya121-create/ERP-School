import mongoose from "mongoose";
import Attendance from "../models/Attendance.js";
import Class from "../models/Class.js";

/* =========================
   HELPER: classId_section → classId
========================= */
const normalizeClassId = (value) => {
  if (!value) return value;
  return value.includes("_") ? value.split("_")[0] : value;
};

/* =====================================================
   MARK ATTENDANCE
   (ONLY CLASS TEACHER, NO FUTURE DATE, NO DUPLICATE)
===================================================== */
export const markAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    let { classId, date, records } = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: "classId, date and records are required"
      });
    }

    /* ---------- BLOCK FUTURE DATE ---------- */
    const today = new Date().toISOString().slice(0, 10);
    if (date > today) {
      return res.status(400).json({
        message: "Future date attendance not allowed"
      });
    }

    /* ---------- NORMALIZE & VALIDATE CLASS ---------- */
    classId = normalizeClassId(classId);

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    /* ---------- SECURITY: ONLY CLASS TEACHER ---------- */
    const isClassTeacher = await Class.exists({
      _id: new mongoose.Types.ObjectId(classId),
      teacherId: new mongoose.Types.ObjectId(teacherId)
    });

    if (!isClassTeacher) {
      return res.status(403).json({
        message: "You are not allowed to mark attendance for this class"
      });
    }

    /* ---------- LOCK: PREVENT DOUBLE MARKING ---------- */
    const alreadyMarked = await Attendance.exists({
      classId: new mongoose.Types.ObjectId(classId),
      date
    });

    if (alreadyMarked) {
      return res.status(409).json({
        message: "Attendance already marked for this date"
      });
    }

    /* ---------- UPSERT ATTENDANCE ---------- */
    const ops = records.map(r => ({
      updateOne: {
        filter: {
          classId: new mongoose.Types.ObjectId(classId),
          studentId: new mongoose.Types.ObjectId(r.studentId),
          date
        },
        update: {
          $set: {
            status: r.status,
            teacherId: new mongoose.Types.ObjectId(teacherId),
            markedAt: new Date()
          }
        },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);

    res.json({
      message: "Attendance saved successfully",
      classId,
      date,
      totalStudents: records.length
    });

  } catch (err) {
    console.error("MARK ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Attendance failed" });
  }
};

/* =====================================================
   STUDENT / PARENT – FULL ATTENDANCE HISTORY
===================================================== */
export const getStudentAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;

    const records = await Attendance.find({
      studentId: new mongoose.Types.ObjectId(studentId)
    })
      .select("date status markedAt")
      .sort({ date: 1 });

    res.json(records);

  } catch (err) {
    console.error("STUDENT ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};

/* =====================================================
   TEACHER – TODAY ATTENDANCE STATUS (DASHBOARD)
===================================================== */
export const getTeacherAttendanceToday = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().toISOString().slice(0, 10);

    const count = await Attendance.countDocuments({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      date: today
    });

    res.json({
      date: today,
      status: count > 0 ? "Marked" : "Pending"
    });

  } catch (err) {
    console.error("TEACHER ATTENDANCE TODAY ERROR:", err);
    res.status(500).json({ message: "Failed to load status" });
  }
};

/* =====================================================
   TEACHER – CLASS ATTENDANCE BY DATE (VIEW ONLY)
===================================================== */
export const getClassAttendanceByDate = async (req, res) => {
  try {
    let { classId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "date is required" });
    }

    classId = normalizeClassId(classId);

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    const records = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
      date
    })
      .populate("studentId", "name rollNo")
      .sort({ "studentId.rollNo": 1 });

    res.json(records);

  } catch (err) {
    console.error("CLASS ATTENDANCE ERROR:", err);
    res.status(500).json({ message: "Failed to load attendance" });
  }
};

/* =====================================================
   ATTENDANCE CALENDAR – MONTH VIEW
===================================================== */
export const getAttendanceCalendar = async (req, res) => {
  try {
    let { classId } = req.params;
    const { month } = req.query; // YYYY-MM

    if (!month) {
      return res.status(400).json({ message: "month is required" });
    }

    classId = normalizeClassId(classId);

    const start = `${month}-01`;
    const end = `${month}-31`;

    const records = await Attendance.find({
      classId: new mongoose.Types.ObjectId(classId),
      date: { $gte: start, $lte: end }
    }).select("date");

    const markedDates = records.map(r => r.date);

    res.json({
      month,
      markedDates,
      totalMarkedDays: markedDates.length
    });

  } catch (err) {
    console.error("ATTENDANCE CALENDAR ERROR:", err);
    res.status(500).json({ message: "Failed to load calendar" });
  }
};
