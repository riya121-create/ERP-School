import Class from "../models/Class.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Timetable from "../models/Timetable.js";
import mongoose from "mongoose";

/* =========================
   HELPER: classId_section → classId
========================= */
const normalizeClassId = (value) => {
  if (!value) return value;
  return value.includes("_") ? value.split("_")[0] : value;
};

/* =========================
   TEACHER PROFILE
========================= */
export const getMyProfile = async (req, res) => {
  try {
    const teacher = await User.findById(req.user.id).select("-password");
    res.json(teacher);
  } catch (err) {
    console.error("GET MY PROFILE ERROR:", err);
    res.status(500).json({ message: "Failed to load profile" });
  }
};


/* =========================
   MY CLASSES (ASSIGNED + TEACHING) ✅ FINAL
========================= */

export const getMyClasses = async (req, res) => {
  try {
  console.log("TEACHER ID:", req.user.id);

    const teacherId = new mongoose.Types.ObjectId(req.user.id);

    /* =====================================
       1️⃣ ASSIGNED CLASSES (CLASS TEACHER)
    ===================================== */
    const assignedClasses = await Class.find({
      teacherId: teacherId
    }).select("name section");

    const formattedAssigned = assignedClasses.map(cls => ({
      _id: cls._id,
      classId: cls._id,
      name: cls.name,
      section: cls.section,
      role: "CLASS_TEACHER"
    }));
    console.log("ASSIGNED CLASSES:", assignedClasses);

/* =====================================
   2️⃣ SUBJECT TEACHER CLASSES (TIMETABLE)
===================================== */
const rows = await Timetable.aggregate([
  { $unwind: "$periods" },
  {
    $match: {
      "periods.teacherId": teacherId
    }
  },
  {
    $project: {
      classId: 1,
      section: 1,
      subject: "$periods.subject"
    }
  }
]);

const uniqueMap = new Map();

rows.forEach(r => {
  uniqueMap.set(
    `${r.classId}_${r.section}_${r.subject}`,
    {
      classId: r.classId,
      section: r.section,
      subject: r.subject
    }
  );
});

const uniqueTeaching = Array.from(uniqueMap.values());

const classDocs = await Class.find({
  _id: { $in: uniqueTeaching.map(u => u.classId) }
}).select("name");

const formattedTeaching = uniqueTeaching.map(u => {
  const cls = classDocs.find(c => c._id.equals(u.classId));
  return {
    _id: `${u.classId}_${u.section}_${u.subject}`,
    classId: u.classId,
    name: cls?.name,
    section: u.section,
    subject: u.subject,
    role: "SUBJECT_TEACHER"
  };
});

  res.json([
  ...formattedAssigned,
  ...formattedTeaching
]);



  } catch (err) {
    console.error("GET MY CLASSES ERROR:", err);
    res.status(500).json({ message: "Failed to load classes" });
  }
};


/* =========================
   STUDENTS BY CLASS ✅ FIXED
========================= */
export const getStudentsByClass = async (req, res) => {
  try {
    let { classId } = req.params;
    classId = normalizeClassId(classId);

    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return res.status(400).json({ message: "Invalid classId" });
    }

    const teacherId = new mongoose.Types.ObjectId(req.user.id);

    // ✅ ONLY CLASS TEACHER ACCESS
    const isClassTeacher = await Class.exists({
      _id: classId,
      teacherId: teacherId
    });

    if (!isClassTeacher) {
      return res.status(403).json({ message: "Access denied" });
    }

    const students = await User.find({
      role: "student",
      classId: new mongoose.Types.ObjectId(classId)
    }).select("name rollNo");

    res.json(students);
  } catch (err) {
    console.error("GET STUDENTS BY CLASS ERROR:", err);
    res.status(500).json({ message: "Failed to load students" });
  }
};


/* =========================
   DASHBOARD STATS ✅ FIXED
========================= */
export const getTeacherDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const teacherObjectId = new mongoose.Types.ObjectId(teacherId);

// 1️⃣ ONLY CLASS TEACHER CLASSES
const classes = await Class.find({
  teacherId: teacherObjectId
}).select("_id");

const classIds = classes.map(c => c._id);
const classesCount = classIds.length;


    const studentsCount = await User.countDocuments({
  role: "student",
  classId: { $in: classIds },
  academicStatus: "active",
  isActive: true
});


    const today = new Date().toISOString().slice(0, 10);

const markedClassesToday = await Attendance.distinct("classId", {
  teacherId: teacherObjectId,
  classId: { $in: classIds },
  date: today
});

    const attendanceStatus =
      markedClassesToday.length === 0
        ? "Pending"
        : markedClassesToday.length === classesCount
        ? "Completed"
        : "Partial";

const lastAttendance = await Attendance.findOne({
  teacherId: teacherObjectId
})
  .sort({ createdAt: -1 })
  .select("createdAt");


    res.json({
      classes: classesCount,
      students: studentsCount,
      attendanceToday: attendanceStatus,
      lastAttendanceTime: lastAttendance
        ? lastAttendance.createdAt
        : null
    });
  } catch (err) {
    console.error("DASHBOARD STATS ERROR:", err);
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

/* =========================
   TEACHER SUBJECTS
========================= */
export const getTeacherSubjects = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const result = await Timetable.aggregate([
      { $unwind: "$periods" },
      {
        $match: {
          "periods.teacherId": new mongoose.Types.ObjectId(teacherId)
        }
      },
      { $project: { subject: "$periods.subject" } }
    ]);

    const subjects = [
      ...new Set(
        result
          .map(r => r.subject?.trim().toLowerCase())
          .filter(Boolean)
      )
    ];

    const formatted = subjects.map((s, i) => ({
      _id: `${i}-${s}`,
      name: s.charAt(0).toUpperCase() + s.slice(1)
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET TEACHER SUBJECTS ERROR:", err);
    res.status(500).json({ message: "Failed to load subjects" });
  }
};

/* =========================
   SUBJECT → CLASSES
========================= */
export const getTeacherSubjectClasses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { subject } = req.query;

    if (!subject) {
      return res.status(400).json({ message: "Subject is required" });
    }

    const rows = await Timetable.aggregate([
      { $unwind: "$periods" },
      {
        $match: {
          "periods.teacherId": new mongoose.Types.ObjectId(teacherId),
          $expr: {
            $eq: [
              { $toLower: "$periods.subject" },
              subject.toLowerCase()
            ]
          }
        }
      },
      { $project: { classId: 1, section: 1 } }
    ]);

    if (!rows.length) return res.json([]);

    const uniqueMap = new Map();
    rows.forEach(r => {
      uniqueMap.set(
        `${r.classId}_${r.section}`,
        { classId: r.classId, section: r.section }
      );
    });

    const unique = Array.from(uniqueMap.values());

    const classes = await Class.find({
      _id: { $in: unique.map(u => u.classId) }
    }).select("name");

    const result = unique.map(u => {
      const cls = classes.find(c => c._id.equals(u.classId));
      return {
        _id: `${u.classId}_${u.section}`,
        classId: u.classId,
        name: cls?.name,
        section: u.section
      };
    });

    res.json(result);
  } catch (err) {
    console.error("GET SUBJECT CLASSES ERROR:", err);
    res.status(500).json({ message: "Failed to load subject classes" });
  }
};
