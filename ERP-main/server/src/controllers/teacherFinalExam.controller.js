import FinalExam from "../models/AdminExam.js";
import Timetable from "../models/Timetable.js";
import { normalizeSubject } from "../utils/normalizeSubject.js";

/* =====================================================
   GET ADMIN-CREATED FINAL EXAMS FOR TEACHER (LIST)
   ROUTE: GET /teacher/final-exams/my
===================================================== */
export const getMyFinalExams = async (req, res) => {
  try {
    const teacherId = req.user._id;

    /* ---------- FIND TEACHER TIMETABLE ---------- */
    const timetables = await Timetable.find({
      "periods.teacherId": teacherId
    })
      .populate("classId", "_id name")
      .lean();

    if (!timetables.length) {
      return res.json([]);
    }

    /* ---------- BUILD TEACHER SUBJECT MAP ---------- */
    const teacherSubjects = [];

    for (const tt of timetables) {
      for (const p of tt.periods || []) {
        if (p.teacherId?.toString() === teacherId.toString()) {
          teacherSubjects.push({
            classId: tt.classId._id.toString(),
            className: tt.classId.name,
            section: tt.section,
            subject: p.subject.trim().toUpperCase()
          });
        }
      }
    }

    /* ---------- FETCH PUBLISHED FINAL EXAMS ---------- */
    const exams = await FinalExam.find({ status: "PUBLISHED" })
      .populate("createdBy", "name")
      .lean();

    const visibleExams = [];

    for (const exam of exams) {
      const matchedSchedule = exam.schedule
        .filter(s =>
          teacherSubjects.some(ts =>
            ts.classId === s.classId.toString() &&
            ts.section === s.section &&
            normalizeSubject(ts.subject) === normalizeSubject(s.subject)

          )
        )
        .map(s => {
          const cls = teacherSubjects.find(
            ts =>
              ts.classId === s.classId.toString() &&
              ts.section === s.section &&
              normalizeSubject(ts.subject) === normalizeSubject(s.subject)

          );

          return {
            ...s,
            className: cls?.className || "—"
          };
        });

      if (matchedSchedule.length > 0) {
        visibleExams.push({
          _id: exam._id,
          name: exam.name,
          examCode: exam.examCode,
          status: exam.status,

          examType: "FINAL",
          maxMarks: exam.maxMarks || null,
          passingMarks: exam.passingMarks || null,
          marksStatus: "PENDING",

          schedule: matchedSchedule,
          createdBy: exam.createdBy,
          createdAt: exam.createdAt
        });
      }
    }

    res.json(visibleExams);
  } catch (err) {
    console.error("GET TEACHER FINAL EXAMS ERROR:", err);
    res.status(500).json({ message: "Failed to load final exams" });
  }
};

/* =====================================================
   GET SINGLE FINAL EXAM DETAIL (TEACHER VIEW)
   ROUTE: GET /teacher/final-exams/:id
===================================================== */
export const getTeacherFinalExamDetail = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { id } = req.params;

    /* ---------- LOAD FINAL EXAM ---------- */
    const exam = await FinalExam.findById(id)
      .populate("createdBy", "name")
      .lean();

    if (!exam || exam.status !== "PUBLISHED") {
      return res.status(404).json({ message: "Final exam not found" });
    }

    /* ---------- FIND TEACHER TIMETABLE ---------- */
    const timetables = await Timetable.find({
      "periods.teacherId": teacherId
    })
      .populate("classId", "_id name")
      .lean();

    const teacherSubjects = [];

    for (const tt of timetables) {
      for (const p of tt.periods || []) {
        if (p.teacherId?.toString() === teacherId.toString()) {
          teacherSubjects.push({
            classId: tt.classId._id.toString(),
            className: tt.classId.name,
            section: tt.section,
            subject: p.subject.trim().toUpperCase()
          });
        }
      }
    }

    /* ---------- FILTER + ENRICH SCHEDULE ---------- */
    const visibleSchedule = exam.schedule
      .filter(s =>
        teacherSubjects.some(ts =>
          ts.classId === s.classId.toString() &&
          ts.section === s.section &&
        normalizeSubject(ts.subject) === normalizeSubject(s.subject)

        )
      )
      .map(s => {
        const cls = teacherSubjects.find(
          ts =>
            ts.classId === s.classId.toString() &&
            ts.section === s.section &&
    normalizeSubject(ts.subject) === normalizeSubject(s.subject)
        );

        return {
          ...s,
          className: cls?.className || "—"
        };
      });

    if (!visibleSchedule.length) {
      return res.status(403).json({
        message: "You are not assigned to this final exam"
      });
    }

    /* ---------- SEND TEACHER SAFE VIEW ---------- */
    res.json({
      _id: exam._id,
      name: exam.name,
      examCode: exam.examCode,
      status: exam.status,
      examType: "FINAL",

      maxMarks: exam.maxMarks || null,
      passingMarks: exam.passingMarks || null,

      createdBy: exam.createdBy,
      createdAt: exam.createdAt,
      schedule: visibleSchedule
    });
  } catch (err) {
    console.error("GET TEACHER FINAL EXAM DETAIL ERROR:", err);
    res.status(500).json({ message: "Failed to load final exam" });
  }
};
