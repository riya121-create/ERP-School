import { Printer, CheckCircle } from "lucide-react";

export default function ReceiptView({ receipt }) {
  if (!receipt) return null;

  return (
    <div className="max-w-sm mx-auto rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
      {/* top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />

      <div className="p-6 space-y-5">
        {/* header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={22} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Fee Receipt</h2>
          <p className="text-xs text-gray-500 mt-0.5">#{receipt.receiptNo}</p>
        </div>

        {/* details */}
        <div className="space-y-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] p-4">
          <Row label="Student"  value={receipt.studentName} />
          <Row label="Amount"   value={`₹${Number(receipt.amount || 0).toLocaleString("en-IN")}`} highlight />
          <Row label="Mode"     value={receipt.paymentMode} />
          <Row label="Date"     value={new Date(receipt.paidAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })} />
          {receipt.referenceNo && <Row label="Reference" value={receipt.referenceNo} />}
        </div>

        <button onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
          <Printer size={15} /> Print Receipt
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? "text-emerald-400 text-base font-bold" : "text-gray-200"}`}>{value}</span>
    </div>
  );
}
