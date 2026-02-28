import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  basicSalary: {
    type: Number,
    required: true
  },
  allowances: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "fixed"
    }
  }],
  deductions: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "fixed"
    }
  }],
  totalSalary: {
    type: Number,
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentHistory: [{
    paymentDate: Date,
    amount: Number,
    paymentMethod: String,
    transactionId: String,
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    }
  }]
}, {
  timestamps: true
});

export default mongoose.model("Salary", salarySchema);
