import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import {
  markAttendance,
  getStudentAttendance,
  getTeacherAttendanceToday,
  getClassAttendanceByDate
} from "../controllers/attendance.controller.js";
import { getAttendanceCalendar } from "../controllers/attendance.controller.js"
const router = express.Router();

/* =====================================================
   TEACHER ROUTES
===================================================== */

// 🔹 Mark / Update attendance (date-wise)
router.post(
  "/mark",
  protect(["teacher"]),
  markAttendance
);

// 🔹 Teacher dashboard – today's attendance status
router.get(
  "/today",
  protect(["teacher"]),
  getTeacherAttendanceToday
);

// 🔹 Class-wise attendance by date (register view)
// URL used by frontend:
// GET /api/attendance/class/:classId?date=YYYY-MM-DD
router.get(
  "/class/:classId",
  protect(["teacher"]),
  getClassAttendanceByDate
);

/* =====================================================
   STUDENT / PARENT ROUTES
===================================================== */

// 🔹 Student / Parent attendance history
router.get(
  "/my",
  protect(["student", "parent"]),
  getStudentAttendance
);
router.get(
  "/calendar/:classId",
  protect(["teacher"]),
  getAttendanceCalendar
)

export default router;
