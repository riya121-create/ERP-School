import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  getStudentFeeProfile,
  collectFee,
  getStudentPayments
} from "../controllers/fee.controller.js";

const router = express.Router();

router.get(
  "/student/:studentId",
  protect(["admin"]),
  getStudentFeeProfile
);

router.get(
  "/payments/:studentId",
  protect(["admin"]),
  getStudentPayments
);

router.post(
  "/pay",
  protect(["admin"]),
  collectFee
);

export default router;
