import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["general", "academic", "event", "holiday", "exam", "meeting", "urgent"],
    default: "general"
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },
  targetAudience: {
    type: String,
    enum: ["all", "students", "parents", "teachers", "admin"],
    default: "all"
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section"
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  attachments: [{
    filename: String,
    url: String,
    type: String
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
