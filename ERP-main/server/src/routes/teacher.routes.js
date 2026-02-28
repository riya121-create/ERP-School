import express from "express";
import { teacherLogout } from "../controllers/teacherAuth.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import {
  getMyFinalExams,
  getTeacherFinalExamDetail
} from "../controllers/teacherFinalExam.controller.js";
import {
  getFinalExamStudents,
  saveFinalExamMarks
} from "../controllers/teacherFinalExamMarks.controller.js";

/* ================= EXAM CONTROLLERS ================= */
import {
  createExam,
  getMyExams,
  getTeacherExamDetail
} from "../controllers/exam.controller.js";

/* ================= EXAM RESULT CONTROLLERS ================= */
import {
  getStudentsForExam,
  saveMarks,
  getExamResultsForTeacher
} from "../controllers/examResult.controller.js";

/* ================= TEACHER CORE CONTROLLERS ================= */
import {
  getMyProfile,
  getMyClasses,
  getTeacherDashboardStats,
  getTeacherSubjects,
  getTeacherSubjectClasses,
  getStudentsByClass
} from "../controllers/teacher.controller.js";

const router = express.Router();

/* =====================================================
   CORE TEACHER ROUTES
===================================================== */
router.get("/me", protect(["teacher"]), getMyProfile);
router.get("/classes", protect(["teacher"]), getMyClasses);
router.get("/dashboard-stats", protect(["teacher"]), getTeacherDashboardStats);

/* =====================================================
   SUBJECT ROUTES
===================================================== */
router.get("/subjects", protect(["teacher"]), getTeacherSubjects);
router.get("/subject-classes", protect(["teacher"]), getTeacherSubjectClasses);

/* =====================================================
   CLASS → STUDENTS ROUTES
   (🔥 both patterns supported for frontend safety)
===================================================== */
router.get(
  "/class/:classId/students",
  protect(["teacher"]),
  getStudentsByClass
);

// 🔥 ALIAS (frontend was calling this)
router.get(
  "/classes/:classId/students",
  protect(["teacher"]),
  getStudentsByClass
);

/* =====================================================
   EXAM ROUTES
===================================================== */

// create exam
router.post("/create", protect(["teacher"]), createExam);
// 🔥 ALIAS for frontend (/teacher/exams/create)
router.post("/exams/create", protect(["teacher"]), createExam);

// teacher exams list (main)
router.get("/my", protect(["teacher"]), getMyExams);

// 🔥 alias used by frontend
router.get("/exams/my", protect(["teacher"]), getMyExams);

// exam detail
router.get("/view/:id", protect(["teacher"]), getTeacherExamDetail);

// marks entry
router.get("/:examId/students", protect(["teacher"]), getStudentsForExam);
router.post("/marks", protect(["teacher"]), saveMarks);

// exam results
router.get("/:examId/results", protect(["teacher"]), getExamResultsForTeacher);


router.get(
  "/final-exams/my",
  protect(["teacher"]),
  getMyFinalExams
);
router.get(
  "/final-exams/:id",
  protect(["teacher"]),
  getTeacherFinalExamDetail
);

/* =====================================================
   FINAL EXAM MARKS
===================================================== */
router.get(
  "/final-exams/:examId/students",
  protect(["teacher"]),
  getFinalExamStudents
);

router.post(
  "/final-exams/marks",
  protect(["teacher"]),
  saveFinalExamMarks
);
router.post(
  "/logout",
  protect(["teacher"]),
  teacherLogout
);
export default router;
