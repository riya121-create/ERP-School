

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
  getTeacherById,
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
  getStudentStats,
  updateStudent,
  deleteStudent,
  generateTransferCertificate,
  uploadStudentDocuments,
  getStudentDocuments,
  updateTeacher,
  deleteTeacher,
  assignSubjectsToTeacher,
  getTeacherSubjects,
  createSalaryStructure,
  getTeacherSalary,
  createLeaveRequest,
  approveLeaveRequest,
  getTeacherLeaves,
  createPerformanceNote,
  getTeacherPerformance
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { uploadDocuments } from "../middleware/upload.middleware.js";
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
   SUBJECTS
========================= */
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    res.json(subjects);
  } catch (err) {
    console.error("Get subjects error:", err);
    res.status(500).json({ message: "Failed to get subjects" });
  }
};

const createSubject = async (req, res) => {
  try {
    const subject = await Subject.create(req.body);
    res.status(201).json(subject);
  } catch (err) {
    console.error("Create subject error:", err);
    res.status(500).json({ message: "Failed to create subject" });
  }
};

router.get("/subjects", protect(["admin"]), getSubjects);
router.post("/subjects", protect(["admin"]), createSubject);

/* =========================
   TEACHERS
========================= */
router.get("/teachers", protect(["admin"]), getAllTeachers);
router.get("/teachers/:teacherId", protect(["admin"]), getTeacherById);
router.post("/teachers", protect(["admin"]), createTeacher);
router.post("/teachers/assign", protect(["admin"]), assignTeacher);

// 🆕 NEW TEACHER MANAGEMENT ROUTES
router.put("/teachers/:teacherId", protect(["admin"]), updateTeacher);
router.delete("/teachers/:teacherId", protect(["admin"]), deleteTeacher);
router.post("/teachers/:teacherId/subjects", protect(["admin"]), assignSubjectsToTeacher);
router.get("/teachers/:teacherId/subjects", protect(["admin"]), getTeacherSubjects);
router.post("/teachers/:teacherId/salary", protect(["admin"]), createSalaryStructure);
router.get("/teachers/:teacherId/salary", protect(["admin"]), getTeacherSalary);
router.post("/teachers/:teacherId/leave", protect(["admin"]), createLeaveRequest);
router.post("/leave/:leaveId/approve", protect(["admin"]), approveLeaveRequest);
router.get("/teachers/:teacherId/leave", protect(["admin"]), getTeacherLeaves);
router.post("/teachers/:teacherId/performance", protect(["admin"]), createPerformanceNote);
router.get("/teachers/:teacherId/performance", protect(["admin"]), getTeacherPerformance);

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

// 🆕 NEW STUDENT MANAGEMENT ROUTES
router.put("/students/:studentId", protect(["admin"]), updateStudent);
router.delete("/students/:studentId", protect(["admin"]), deleteStudent);
router.post("/students/:studentId/tc", protect(["admin"]), generateTransferCertificate);
router.post("/students/:studentId/documents", protect(["admin"]), uploadDocuments.array('documents', 10), uploadStudentDocuments);
router.get("/students/:studentId/documents", protect(["admin"]), getStudentDocuments);

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
