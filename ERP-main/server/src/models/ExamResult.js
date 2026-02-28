import mongoose from "mongoose";

const examResultSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    classId: {                         // 🔥 MAIN FIX
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true
    },

    marks: {
      type: Number,
      default: null
    },

    absent: {
      type: Boolean,
      default: false
    },

    percentage: {
      type: Number,
      default: null
    },
evaluation: {
  type: String,   // Excellent / Good / Poor
  default: null
},

    result: {
      type: String,
      enum: ["PASS", "FAIL", "ABSENT", "PENDING"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

/* 🔒 Prevent duplicate result per student per exam */
examResultSchema.index(
  { examId: 1, studentId: 1 },
  { unique: true }
);

export default mongoose.model("ExamResult", examResultSchema);
