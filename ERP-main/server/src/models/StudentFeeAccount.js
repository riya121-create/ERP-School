import mongoose from "mongoose";

const StudentFeeAccountSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  session: String,

  tuition: {
    monthly: Number,
    annual: Number
  },

  transport: {
    mode: { type: String, enum: ["TRANSPORT", "STOP"] },
    stopId: String,
    monthly: Number,
    annual: Number
  },

  totalAnnual: Number,
  totalPaid: { type: Number, default: 0 },
  totalDue: Number,

  status: { type: String, enum: ["CLEAR", "PARTIAL", "DUE"], default: "DUE" }
}, { timestamps: true });

export default mongoose.model("StudentFeeAccount", StudentFeeAccountSchema);
