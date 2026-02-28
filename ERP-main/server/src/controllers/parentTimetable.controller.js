import Timetable from "../models/Timetable.js";
import User from "../models/User.js";

/* =====================================================
   👨‍👩‍👧 PARENT: GET STUDENT TIMETABLE
   ROUTE: GET /parent/timetable/:studentId
===================================================== */
export const getParentStudentTimetable = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parentId = req.user._id;

    /* =========================
       VERIFY PARENT
    ========================= */
    const parent = await User.findById(parentId)
      .select("phone")
      .lean();

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    /* =========================
       VERIFY STUDENT BELONGS TO PARENT
    ========================= */
    const student = await User.findOne({
      _id: studentId,
      role: "student",
      parentPhone: parent.phone,
      isActive: true
    })
      .populate("classId", "name section")
      .lean();

    if (!student || !student.classId) {
      return res.status(403).json({
        message: "You are not allowed to view this timetable"
      });
    }

    /* =========================
       FETCH TIMETABLE
    ========================= */
   const timetable = await Timetable.find({
  classId: student.classId._id,
  section: student.classId.section.toUpperCase() // 🔥 FIX
})

      .populate("periods.teacherId", "name")
      .sort({ day: 1 })
      .lean();

    return res.json(timetable);
  } catch (err) {
    console.error("❌ GET PARENT TIMETABLE ERROR:", err);
    return res.status(500).json({
      message: "Failed to load timetable"
    });
  }
};
