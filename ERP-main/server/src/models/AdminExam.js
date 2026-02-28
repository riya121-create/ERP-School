// models/FinalExam.js
import mongoose from "mongoose";

const finalExamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  examCode: { type: String, required: true, unique: true },

  academicYear: String,
  board: String,          // CBSE / ICSE / Internal
  description: String,

  /* =====================
     CLASS + SUBJECT SCHEDULE
  ===================== */
  schedule: [
    {
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
        required: true
      },
      className: String,
      section: String,

      subject: String,

      date: String,
      startTime: String,
      endTime: String,
      durationMinutes: Number
    }
  ],

  /* =====================
     RULES & POLICIES
  ===================== */
  rules: {
    allowAbsent: { type: Boolean, default: true },
    absentAsFail: { type: Boolean, default: true },
    graceMarks: { type: Boolean, default: false },
    lockAfterPublish: { type: Boolean, default: true }
  },

  status: {
    type: String,
    enum: ["DRAFT", "PUBLISHED"],
    default: "DRAFT"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

export default mongoose.model("FinalExam", finalExamSchema);
