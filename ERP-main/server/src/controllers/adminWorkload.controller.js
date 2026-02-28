import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/* =====================================================
   ADMIN: TEACHER WEEKLY WORKLOAD (FINAL SAFE VERSION)
===================================================== */
export const getTeacherWeeklyWorkload = async (req, res) => {
  try {
    const { teacherId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ message: "Invalid teacherId" });
    }

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

    const teacher = await User.findById(teacherObjectId).select("name");
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    /* ================= FETCH TIMETABLES ================= */
    const timetables = await Timetable.find({
      "periods.teacherId": teacherObjectId
    })
      .populate("classId", "name")
      .populate("periods.teacherId", "_id") // 🔥 IMPORTANT FIX
      .lean();

    /* ================= DAY MAP ================= */
    const days = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    let totalPeriods = 0;

    for (const tt of timetables) {
      const day = tt.day?.trim();
      if (!days[day]) continue;

      for (const p of tt.periods) {
        const pid =
          typeof p.teacherId === "object"
            ? p.teacherId?._id?.toString()
            : p.teacherId?.toString();

        if (pid !== teacherId) continue;

        days[day].push({
        subject: p.subject?.trim().toUpperCase() || "UNKNOWN SUBJECT",

          class: tt.classId?.name || "—",
          section: tt.section || "—",
          startTime: p.startTime,
          endTime: p.endTime
        });

        totalPeriods++;
      }
    }

    /* ================= SORT PERIODS (TIME-WISE) ================= */
    Object.keys(days).forEach(day => {
      days[day].sort((a, b) =>
        (a.startTime || "").localeCompare(b.startTime || "")
      );
    });

    res.json({
      teacher: teacher.name,
      totalPeriods,
      days
    });

  } catch (err) {
    console.error("TEACHER WORKLOAD ERROR:", err);
    res.status(500).json({ message: "Failed to fetch workload" });
  }
};
