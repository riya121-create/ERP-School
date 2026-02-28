import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { previewTimetableCSV } from "../controllers/timetableCsv.controller.js";

import {
  upsertTimetable,          // single day
  upsertWeekTimetable,      // create full week
  updateWeekTimetable,      // ✅ edit full week
  getTimetableByClass,      // ✅ fetch for edit
  getStudentTimetable,
  getAllTimetablesForAdmin,
  getTeacherTimetable
} from "../controllers/timetable.controller.js";

const router = express.Router();

/* =====================================================
   ADMIN ROUTES
===================================================== */

router.post(
  "/admin/day",
  protect(["admin"]),
  upsertTimetable
);

router.post(
  "/admin/week",
  protect(["admin"]),
  upsertWeekTimetable
);

router.put(
  "/admin/update-week",
  protect(["admin"]),
  updateWeekTimetable
);


router.post(
  "/admin/csv/preview",
  protect(["admin"]),
  upload.single("file"),
  previewTimetableCSV
);

router.get(
  "/admin/by-class",
  protect(["admin"]),
  getTimetableByClass
);

router.get(
  "/admin/all",
  protect(["admin"]),
  getAllTimetablesForAdmin
);

/* =====================================================
   STUDENT ROUTES
===================================================== */

router.get(
  "/student",
  protect(["student"]),
  getStudentTimetable
);

/* =====================================================
   TEACHER ROUTES
===================================================== */

router.get(
  "/teacher",
  protect(["teacher"]),
  getTeacherTimetable
);

export default router;
