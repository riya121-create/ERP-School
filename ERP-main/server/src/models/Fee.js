import mongoose from "mongoose";

const feeSchema = new mongoose.Schema({
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
  feeType: {
    type: String,
    enum: ["tuition", "transport", "library", "lab", "exam", "other"],
    default: "tuition"
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "paid", "partial", "overdue"],
    default: "pending"
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "online", "cheque", "bank_transfer"],
    default: "online"
  },
  transactionId: {
    type: String
  },
  description: {
    type: String
  },
  academicYear: {
    type: String,
    required: true
  },
  month: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Fee = mongoose.model("Fee", feeSchema);
export default Fee;
