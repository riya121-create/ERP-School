import express from "express";
import { login, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// 🔐 LOGIN ONLY (NO PUBLIC REGISTER)
router.post("/login", login);

// 🔐 FORCE PASSWORD CHANGE (teacher / parent)
router.post(
  "/change-password",
  protect(["teacher", "parent"]),
  changePassword
);

export default router;