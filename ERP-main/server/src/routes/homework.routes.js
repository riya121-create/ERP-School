import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createHomework,
  getMyHomework,
  getHomeworkDetail,
  gradeSubmission,
  deleteHomework,
  getHomeworkStats
} from "../controllers/homework.controller.js";

const router = express.Router();

// Teacher homework routes
router.post("/", protect(["teacher"]), createHomework);
router.get("/", protect(["teacher"]), getMyHomework);
router.get("/stats", protect(["teacher"]), getHomeworkStats);
router.get("/:id", protect(["teacher"]), getHomeworkDetail);
router.patch("/:homeworkId/:studentId/grade", protect(["teacher"]), gradeSubmission);
router.delete("/:id", protect(["teacher"]), deleteHomework);

export default router;
