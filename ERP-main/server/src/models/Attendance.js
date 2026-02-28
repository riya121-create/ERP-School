import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      index: true
    },

    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    // YYYY-MM-DD (school friendly, timezone safe)
    date: {
      type: String,
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["present", "absent"],
      required: true
    },

    // exact time when attendance was marked (audit)
    markedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// 🔐 ONE STUDENT → ONE CLASS → ONE DAY
attendanceSchema.index(
  { classId: 1, studentId: 1, date: 1 },
  { unique: true }
);
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ classId: 1, date: 1 });
attendanceSchema.index({ studentId: 1, date: 1 });
attendanceSchema.index({ teacherId: 1, date: 1 });

export default mongoose.model("Attendance", attendanceSchema);
