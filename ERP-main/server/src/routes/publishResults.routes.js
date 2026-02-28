import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  publishExamResults,
  getPublishedExams,
  getPublishedResults,
  unpublishResults
} from "../controllers/publishResults.controller.js";

const router = express.Router();

// Teacher publish results routes
router.post("/publish", protect(["teacher"]), publishExamResults);
router.get("/published", protect(["teacher"]), getPublishedExams);
router.get("/published/:examId", protect(["teacher"]), getPublishedResults);
router.patch("/unpublish/:examId", protect(["teacher"]), unpublishResults);

export default router;
