import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.middleware.js";
import {
  getMyStudentProfile,
  bulkUploadStudents
} from "../controllers/student.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/* ================= STUDENT ================= */
router.get("/me", protect(["student"]), getMyStudentProfile);

/* ================= ADMIN ================= */
router.post(
  "/bulk-upload",
  protect(["admin"]),
  upload.single("file"),
  bulkUploadStudents
);

export default router;
