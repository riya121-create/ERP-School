import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
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
    fileUrl: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true // pdf, doc, ppt, image, etc.
    },
    fileSize: {
      type: Number // in bytes
    },
    category: {
      type: String,
      enum: ["notes", "slides", "assignment", "reference", "other"],
      default: "notes"
    },
    tags: [{
      type: String
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    downloadCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Indexes for better performance
noteSchema.index({ classId: 1, createdAt: -1 });
noteSchema.index({ teacherId: 1 });
noteSchema.index({ subject: 1 });
noteSchema.index({ tags: 1 });

export default mongoose.model("Note", noteSchema);
