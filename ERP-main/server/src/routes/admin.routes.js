

import express from "express";
import { getFinalExamStructure } from "../controllers/admin.controller.js";
import { createFinalExam } 
from "../controllers/adminFinalExam.controller.js";
import{getAllFinalExams}from "../controllers/adminFinalExam.controller.js";
import { publishFinalExam } from "../controllers/adminFinalExam.controller.js";
import{ getFinalExamById}from "../controllers/adminFinalExam.controller.js";
import {
  createClass,
  assignTeacher,
  createTeacher,
  getAllTeachers,
  getAllClasses,
  createStudent,
  getStudentsByClass,
  getDashboardStats,
  expelStudent,
  transferStudent,
  markStudentAlumni,
  getStudentsByStatus,
  promoteStudent,
    getTeacherLoginHistory,
    getStudentStats
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import {
  getAcademicStructure
} from "../controllers/adminAcademicStructure.controller.js";
import { getTeacherWeeklyWorkload } from "../controllers/adminWorkload.controller.js";
import transportRoutes from "./transport.routes.js";
import { assignTransportToStudent } from "../controllers/admin.controller.js";

const router = express.Router();
router.use(protect(["admin"]));

/* =========================
   DASHBOARD
========================= */
router.get("/dashboard-stats", protect(["admin"]), getDashboardStats);

/* =========================
   CLASSES
========================= */
router.get("/classes", protect(["admin"]), getAllClasses);
router.post("/classes", protect(["admin"]), createClass);

/* =========================
   TEACHERS
========================= */
router.get("/teachers", protect(["admin"]), getAllTeachers);
router.post("/teachers", protect(["admin"]), createTeacher);
router.post("/teachers/assign", protect(["admin"]), assignTeacher);

/* =========================
   STUDENTS
========================= */
router.post("/students", protect(["admin"]), createStudent);

// 🔥 MAIN STUDENT LIST (STATUS BASED)
router.get("/students", protect(["admin"]), getStudentsByStatus);

// class-wise active students
router.get(
  "/classes/:classId/students",
  protect(["admin"]),
  getStudentsByClass
);
// 🔥 STUDENT STATUS COUNTS (FOR TABS)
router.get(
  "/students/stats",
  protect(["admin"]),
  getStudentStats
);
router.post(
  "/students/transport",
  protect(["admin"]),
  assignTransportToStudent
);

/* =========================
   STUDENT STATUS ACTIONS
========================= */
router.post("/students/promote", protect(["admin"]), promoteStudent); // 🔼
router.post("/students/expel", protect(["admin"]), expelStudent);
router.post("/students/transfer", protect(["admin"]), transferStudent);
router.post("/students/alumni", protect(["admin"]), markStudentAlumni);
/* =========================
   TEACHER LOGIN ACTIVITY
========================= */
router.get(
  "/teacher-login-history",
  protect(["admin"]),
  getTeacherLoginHistory
);
/* =========================
   ACADEMIC STRUCTURE (FROM TIMETABLE)
========================= */
router.get(
  "/academic-structure",
  protect(["admin"]),
  getAcademicStructure
);
router.get(
  "/teachers/:teacherId/workload",
  protect(["admin"]),
  getTeacherWeeklyWorkload
);



router.get(
  "/final-exam-structure",
  protect(["admin"]),
  getFinalExamStructure
);router.post(
  "/exams/final",
  protect(["admin"]),
  createFinalExam
);


router.patch(
  "/final-exams/:id/publish",
  protect(["admin"]),
  publishFinalExam
);


router.get(
  "/exams/final",
  protect(["admin"]),
  getAllFinalExams
);

router.get(
  "/exams/final/:id",
  protect(["admin"]),
  getFinalExamById
);
router.use("/transport", transportRoutes);




export default router;
