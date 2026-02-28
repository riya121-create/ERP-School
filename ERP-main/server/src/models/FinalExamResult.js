import mongoose from "mongoose";

const finalExamResultSchema = new mongoose.Schema(
  {
    finalExamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AdminExam",
      required: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },

    section: {
      type: String,
      required: true
    },

    subject: {
      type: String,
      required: true
    },

    marks: {
      type: Number,
      default: null
    },

    status: {
      type: String,
      enum: ["ABSENT", "PRESENT"],
      default: "PRESENT"
    },

    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

// 🔥 UNIQUE = one student, one final exam, one subject
finalExamResultSchema.index(
  { finalExamId: 1, studentId: 1, subject: 1 },
  { unique: true }
);

export default mongoose.model("FinalExamResult", finalExamResultSchema);
