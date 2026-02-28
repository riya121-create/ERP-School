import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  name: {
    type: String, // e.g. "10th", "B.Tech CSE"
    required: true
  },
  section: {
    type: String, // e.g. "A", "B"
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

export default mongoose.model("Class", classSchema);
