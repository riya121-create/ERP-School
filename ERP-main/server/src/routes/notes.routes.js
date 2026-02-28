import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  uploadNote,
  getMyNotes,
  getNoteDetail,
  updateNote,
  deleteNote,
  getNotesStats
} from "../controllers/notes.controller.js";

const router = express.Router();

// Teacher notes routes
router.post("/", protect(["teacher"]), uploadNote);
router.get("/", protect(["teacher"]), getMyNotes);
router.get("/stats", protect(["teacher"]), getNotesStats);
router.get("/:id", protect(["teacher"]), getNoteDetail);
router.put("/:id", protect(["teacher"]), updateNote);
router.delete("/:id", protect(["teacher"]), deleteNote);

export default router;
