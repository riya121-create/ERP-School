import User from "../models/User.js";

/* =====================================================
   👨‍👩‍👧 GET PARENT DASHBOARD CONTEXT
   - Parent basic info
   - Linked students (phone-based)
   - activeStudentId (🔥 key for marks / attendance / timetable)
===================================================== */
export const getParentContext = async (req, res) => {
  try {
    /* =========================
       LOAD PARENT (NO POPULATE ❌)
    ========================= */
    const parent = await User.findById(req.user._id)
      .select("_id name phone role")
      .lean();

    if (!parent) {
      return res.status(404).json({
        message: "Parent not found"
      });
    }

    /* =========================
       LOAD LINKED STUDENTS
       (PHONE-BASED LINKING ✅)
    ========================= */
    const students = await User.find({
      role: "student",
      parentPhone: parent.phone,
      isActive: true
    })
      .populate("classId", "name section")
      .select("_id name rollNo classId")
      .lean();

    /* =========================
       DETERMINE ACTIVE STUDENT
       (SAFE DEFAULT ✅)
    ========================= */
    const activeStudentId =
      students.length > 0 ? students[0]._id : null;

    /* =========================
       RESPONSE (FRONTEND READY)
    ========================= */
    return res.json({
      parent: {
        _id: parent._id,
        name: parent.name,
        phone: parent.phone,
        role: parent.role
      },

      /* 🔥 USED BY:
         - /parent/results/:studentId
         - /parent/attendance/:studentId
         - /timetable/student/:studentId
      */
      activeStudentId,

      /* 🔁 MULTI-CHILD READY */
      students
    });
  } catch (err) {
    console.error("❌ GET PARENT CONTEXT ERROR:", err);
    return res.status(500).json({
      message: "Failed to load parent context"
    });
  }
};
