import FeeReceiptCounter from "../models/FeeReceiptCounter.js";

export default async function generateReceiptNo() {
  const counter = await FeeReceiptCounter.findOneAndUpdate(
    { key: "FEE" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `FEE-${new Date().getFullYear()}-${counter.seq}`;
}
