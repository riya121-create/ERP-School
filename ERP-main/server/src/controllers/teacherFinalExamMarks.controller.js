import FinalExam from "../models/AdminExam.js";
import Timetable from "../models/Timetable.js";
import User from "../models/User.js";
import FinalExamResult from "../models/FinalExamResult.js";
import { normalizeSubject } from "../utils/normalizeSubject.js";

/* =====================================================
   GET STUDENTS FOR FINAL EXAM (TEACHER MARKS ENTRY)
   ROUTE: GET /teacher/final-exams/:examId/students
===================================================== */
export const getFinalExamStudents = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { examId } = req.params;
    const { classId, section, subject } = req.query;

    /* ---------- BASIC VALIDATION ---------- */
    if (!classId || !section || !subject) {
      return res.status(400).json({
        message: "classId, section and subject are required"
      });
    }

    

    /* ---------- VERIFY FINAL EXAM ---------- */
    const exam = await FinalExam.findById(examId).lean();
    if (!exam || exam.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Final exam not found" });
    }

    /* ---------- VERIFY TEACHER ACCESS ---------- */
    // 🔹 RAW subject for authorization
const rawSubject = subject.trim();

const timetable = await Timetable.findOne({
  classId,
  section,
  periods: {
    $elemMatch: {
      teacherId,
      subject: {
        $regex: new RegExp(`^${rawSubject}$`, "i")
      }
    }
  }
});

if (!timetable) {
  return res.status(403).json({
    message: "You are not assigned to this subject"
  });
}

// 🔹 NORMALIZED subject ONLY for results
const normalizedSubject = normalizeSubject(subject);


    /* ---------- FETCH STUDENTS ---------- */
    const students = await User.find({
      role: "student",
      academicStatus: "active",
      classId
    }).select("_id name rollNo");

    /* ---------- PREPARE / UPSERT RESULTS ---------- */
    const results = [];

    for (const s of students) {
      const r = await FinalExamResult.findOneAndUpdate(
        {
          finalExamId: examId,
          studentId: s._id,
          subject: normalizedSubject

        },
        {
          $setOnInsert: {
            finalExamId: examId,
            studentId: s._id,
            classId,
            section,
            subject: normalizedSubject,

            evaluatedBy: teacherId,
            status: "PRESENT"
          }
        },
        {
          upsert: true,
          new: true
        }
      );

      results.push({
        resultId: r._id,
        studentId: s._id,
        name: s.name,
        rollNo: s.rollNo,
        marks: r.marks ?? "",
        status: r.status
      });
    }

    /* ---------- RESPONSE ---------- */
    res.json({
      exam: {
        _id: exam._id,
        name: exam.name,
        examCode: exam.examCode,
        maxMarks: exam.maxMarks || null
      },
       subject: normalizedSubject,
      classId,
      section,
      students: results
    });
  } catch (err) {
    console.error("FINAL EXAM STUDENTS ERROR:", err);
    res.status(500).json({
      message: "Failed to load final exam students"
    });
  }
};

/* =====================================================
   SAVE FINAL EXAM MARKS (TEACHER)
   ROUTE: POST /teacher/final-exams/marks
===================================================== */
export const saveFinalExamMarks = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { results } = req.body;

    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({
        message: "Results array is required"
      });
    }

    /* ---------- SAVE MARKS ---------- */
    for (const r of results) {
      if (!r.resultId) continue;

      await FinalExamResult.findByIdAndUpdate(
        r.resultId,
        {
          marks:
            r.status === "ABSENT"
              ? null
              : Number.isFinite(r.marks)
              ? r.marks
              : null,
          status: r.status || "PRESENT",
          evaluatedBy: teacherId,
          evaluatedAt: new Date()
        }
      );
    }

    res.json({
      message: "Final exam marks saved successfully"
    });
  } catch (err) {
    console.error("SAVE FINAL EXAM MARKS ERROR:", err);
    res.status(500).json({
      message: "Failed to save final exam marks"
    });
  }
};
