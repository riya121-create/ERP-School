import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getParentDashboard,
  getChildAttendance,
  getChildHomework,
  getChildExams,
  getAnnouncements
} from "../controllers/parentDashboard.controller.js";

const router = express.Router();

// Parent dashboard routes
router.get("/dashboard", protect(["parent"]), getParentDashboard);
router.get("/attendance/:childId", protect(["parent"]), getChildAttendance);
router.get("/homework/:childId", protect(["parent"]), getChildHomework);
router.get("/exams/:childId", protect(["parent"]), getChildExams);
router.get("/announcements/:childId", protect(["parent"]), getAnnouncements);

export default router;
