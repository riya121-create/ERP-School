import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  adminAttendanceOverview,
  adminAttendanceByClass,
  adminAttendanceByStudent,
  adminAttendanceLogs,
} from "../controllers/adminAttendance.controller.js";

const router = express.Router();

/* ======================
   ADMIN ATTENDANCE
====================== */

router.get(
  "/attendance",
  protect(["admin"]),
  adminAttendanceOverview
);

router.get(
  "/attendance/classes",
  protect(["admin"]),
  adminAttendanceByClass
);

router.get(
  "/attendance/students",
  protect(["admin"]),
  adminAttendanceByStudent
);

router.get(
  "/attendance/logs",
  protect(["admin"]),
  adminAttendanceLogs
);

export default router;
