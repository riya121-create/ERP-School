import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyStudentProfile,
  bulkUploadStudents,
  getMyResults,
  getMyFees,
  getMyHomework,
  getMyNotes,
  getMyExams,
} from "../controllers/student.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ================= STUDENT ================= */
router.get("/me",       protect(["student"]), getMyStudentProfile);
router.get("/results",  protect(["student"]), getMyResults);
router.get("/fees",     protect(["student"]), getMyFees);
router.get("/homework", protect(["student"]), getMyHomework);
router.get("/notes",    protect(["student"]), getMyNotes);
router.get("/exams",    protect(["student"]), getMyExams);

/* ================= ADMIN ================= */
router.post(
  "/bulk-upload",
  protect(["admin"]),
  upload.single("file"),
  bulkUploadStudents
);

export default router;
