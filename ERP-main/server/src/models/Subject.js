import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ["core", "elective", "practical", "language"],
    default: "core"
  },
  department: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  credits: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  }],
  teachers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, {
  timestamps: true
});

export default mongoose.model("Subject", subjectSchema);
