import express from "express";

import {
  createExam,
  getTeacherVisibleExams,
  getTeacherExamDetail
} from "../controllers/exam.controller.js";

import {
  getStudentsForExam,
  saveMarks,
  getExamResultsForTeacher
} from "../controllers/examResult.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/* ================= CREATE EXAM ================= */
router.post(
  "/create",
  protect(["teacher"]),
  createExam
);

/* ================= TEACHER VISIBLE EXAMS =================
   👉 Teacher + Admin (PUBLISHED)
=========================================================== */
router.get(
  "/visible",
  protect(["teacher"]),
  getTeacherVisibleExams
);

/* ================= VIEW EXAM (TEACHER) ================= */
router.get(
  "/view/:id",
  protect(["teacher"]),
  getTeacherExamDetail
);

/* ================= STUDENTS FOR MARKS ENTRY ================= */
router.get(
  "/:examId/students",
  protect(["teacher"]),
  getStudentsForExam
);

/* ================= SAVE MARKS ================= */
router.post(
  "/marks",
  protect(["teacher"]),
  saveMarks
);

/* ================= EXAM RESULTS ================= */
router.get(
  "/:examId/results",
  protect(["teacher"]),
  getExamResultsForTeacher
);
export default router;
