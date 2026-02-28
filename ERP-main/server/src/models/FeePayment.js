import mongoose from "mongoose";

const FeePaymentSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  session: String,

  months: [String],
  amount: Number,

  paymentMode: { type: String, enum: ["CASH", "UPI", "BANK", "ONLINE"] },
  referenceNo: String,

  receiptNo: String,
  collectedBy: String,
  paidAt: { type: Date, default: Date.now }
});

export default mongoose.model("FeePayment", FeePaymentSchema);
