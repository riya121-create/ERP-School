import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getParentContext
} from "../controllers/parent.controller.js";
import { getParentResults } from "../controllers/parentResults.controller.js";
import { getParentStudentTimetable } from "../controllers/parentTimetable.controller.js";
import { getChildAttendance } from "../controllers/parentAttendance.controller.js";
import { getParentFeeSummary } from "../controllers/parentFees.controller.js";
const router = express.Router();

/* =====================================================
   🔐 PARENT AUTH GUARD
   → sirf parent role allowed
===================================================== */
router.use(protect(["parent"]));

/* =====================================================
   👨‍👩‍👧 PARENT DASHBOARD CONTEXT
   - linked students
   - activeStudentId (marks ke liye 🔥)
===================================================== */
router.get("/me", getParentContext);
router.get("/results/:studentId", getParentResults);
router.get("/timetable/:studentId", getParentStudentTimetable);
router.get("/attendance/:studentId", getChildAttendance);
router.get("/fees/:studentId", getParentFeeSummary);
export default router;
