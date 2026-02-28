import mongoose from "mongoose";
import Exam from "../models/Exam.js";
import Timetable from "../models/Timetable.js";

/* =====================================================
   CREATE EXAM (TEACHER) ✅ FINAL SAFE
===================================================== */
export const createExam = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const data = req.body;

    /* ---------- BASIC VALIDATION ---------- */
    if (!data.name || !data.subject || !data.date) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(data.selectedClasses) || data.selectedClasses.length === 0) {
      return res.status(400).json({ message: "Select at least one class" });
    }

    if (Number(data.passingMarks) > Number(data.maxMarks)) {
      return res.status(400).json({ message: "Passing marks cannot exceed max marks" });
    }

    /* ---------- NORMALIZE SUBJECT ---------- */
    let subjectValue = data.subject;
    if (typeof subjectValue === "object" && subjectValue !== null) {
      subjectValue = subjectValue.name || subjectValue.subject || "";
    }

    subjectValue = subjectValue.trim();
    if (!subjectValue) {
      return res.status(400).json({ message: "Invalid subject" });
    }

    /* =================================================
       🔒 HARD VALIDATION (TIMETABLE = SOURCE OF TRUTH)
    ================================================= */
    const parsedClasses = data.selectedClasses.map(key => {
      const [classId, section] = key.split("_");

      if (!mongoose.Types.ObjectId.isValid(classId)) {
        throw new Error("Invalid classId format");
      }

      return {
        classId: new mongoose.Types.ObjectId(classId),
        section
      };
    });

    const classIds = parsedClasses.map(c => c.classId);

    const validTimetable = await Timetable.aggregate([
      { $unwind: "$periods" },
      {
        $match: {
          classId: { $in: classIds },
          "periods.teacherId": new mongoose.Types.ObjectId(teacherId),
          $expr: {
            $eq: [
              { $toLower: "$periods.subject" },
              subjectValue.toLowerCase()
            ]
          }
        }
      }
    ]);

    if (!validTimetable.length) {
      return res.status(403).json({
        message: "You are not allowed to create exam for this subject/class"
      });
    }

    /* =================================================
       ✅ FORMAT CLASSES (SCHEMA SAFE)
    ================================================= */
    const classes = parsedClasses.map(c => ({
      classId: c.classId,
      section: c.section
    }));

    /* =================================================
       ✅ CREATE EXAM
    ================================================= */
    const exam = await Exam.create({
      name: String(data.name),
      type: data.type,
      mode: data.mode || "Offline",

      subject: subjectValue, // 🔥 subject exam-level pe rahega

      scope: data.scope || "CUSTOM",
      classes,

      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,

      maxMarks: Number(data.maxMarks),
      passingMarks: Number(data.passingMarks),

      syllabus: Array.isArray(data.syllabus) ? data.syllabus : [],
      rules: data.rules || {},

      evaluationRules: Array.isArray(data.evaluationRules)
        ? data.evaluationRules
        : [],

      status: data.status || "DRAFT",
      marksStatus: "PENDING",

      createdBy: new mongoose.Types.ObjectId(teacherId)
    });

    res.status(201).json({
      message: "✅ Exam created successfully",
      exam
    });

  } catch (err) {
    console.error("CREATE EXAM ERROR:", err);
    res.status(500).json({
      message: err.message || "Server error while creating exam"
    });
  }
};

/* =====================================================
   GET TEACHER VISIBLE EXAMS ✅ CLEAN
===================================================== */
export const getTeacherVisibleExams = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const exams = await Exam.find({
      status: "PUBLISHED",
      $or: [
        { createdBy: teacherId },
        { scope: "GLOBAL" }
      ]
    }).sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    console.error("GET VISIBLE EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};

/* =====================================================
   GET EXAM DETAIL (TEACHER VIEW) ✅ SAFE
===================================================== */
export const getTeacherExamDetail = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const exam = await Exam.findById(req.params.id)
      .populate("classes.classId", "name section");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (
      exam.scope !== "GLOBAL" &&
      exam.createdBy.toString() !== teacherId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ exam });
  } catch (err) {
    console.error("GET EXAM DETAIL ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   GET MY EXAMS (CREATED BY TEACHER)
===================================================== */
export const getMyExams = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const exams = await Exam.find({
      createdBy: teacherId
    }).sort({ createdAt: -1 });

    res.json(exams);
  } catch (err) {
    console.error("GET MY EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load exams" });
  }
};
