import mongoose from "mongoose";

const homeworkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    dueDate: {
      type: Date,
      required: true
    },
    fileUrl: {
      type: String // Optional attachment
    },
    fileName: {
      type: String // Original filename
    },
    fileType: {
      type: String // pdf, doc, image, etc.
    },
    submissions: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      submittedAt: {
        type: Date,
        default: Date.now
      },
      fileUrl: String,
      fileName: String,
      fileType: String,
      status: {
        type: String,
        enum: ["submitted", "graded", "late"],
        default: "submitted"
      },
      marks: Number,
      feedback: String,
      gradedAt: Date,
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Indexes for better performance
homeworkSchema.index({ classId: 1, dueDate: 1 });
homeworkSchema.index({ teacherId: 1 });
homeworkSchema.index({ "submissions.studentId": 1 });

export default mongoose.model("Homework", homeworkSchema);
