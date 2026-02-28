import { useEffect, useState } from "react";
import api from "@/services/api";

/*
=====================================================
STUDENT FEE PROFILE — FAANG / PROD VERSION
• Clear financial snapshot
• Auditable payment history
• Safe loading + error handling
• Mobile-first counter UX
=====================================================
*/

export default function StudentFeeProfile({ studentId }) {
  const [fee, setFee] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!studentId) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const [feeRes, payRes] = await Promise.all([
          api.get(`/admin/fees/student/${studentId}`),
          api.get(`/admin/fees/payments/${studentId}`)
        ]);

        if (!mounted) return;

        setFee(feeRes.data);
        setPayments(Array.isArray(payRes.data) ? payRes.data : []);
      } catch (err) {
        console.error("Fee profile error:", err);
        setError("Failed to load fee details");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [studentId]);

  /* ================= STATES ================= */

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-2xl border animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        {error}
      </div>
    );
  }

  if (!fee) return null;

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">
          📘 Student Fee Profile
        </h2>
        <p className="text-sm text-gray-500">
          Financial snapshot & payment history
        </p>
      </div>

      {/* SNAPSHOT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Annual Fee"
          value={formatINR(fee.totalAnnual)}
        />
        <StatCard
          label="Paid"
          value={formatINR(fee.totalPaid)}
        />
        <StatCard
          label="Due"
          value={formatINR(fee.totalDue)}
          danger
        />
        <StatCard
          label="Status"
          value={fee.status}
          badge
        />
      </div>

      {/* PAYMENT HISTORY */}
      <div className="bg-white border rounded-2xl overflow-hidden">

        <div className="bg-gray-100 px-4 py-3 font-semibold text-sm">
          Payment History
        </div>

        {payments.length === 0 ? (
          <div className="p-6 text-center text-gray-500 text-sm">
            No payments recorded yet
          </div>
        ) : (
          payments.map(p => (
            <div
              key={p._id}
              className="grid grid-cols-3 md:grid-cols-5 gap-2 px-4 py-3 text-sm border-t"
            >
              <div className="font-mono text-xs">
                {p.receiptNo || "—"}
              </div>

              <div className="font-semibold">
                {formatINR(p.amount)}
              </div>

              <div className="hidden md:block text-gray-600">
                {p.paymentMode || "—"}
              </div>

              <div className="hidden md:block text-gray-600">
              {formatDate(p.paidAt)}


              </div>

              <div className="text-right text-xs text-gray-500">
                {p.referenceNo || "—"}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const StatCard = ({ label, value, danger, badge }) => (
  <div
    className={`border rounded-xl p-4 ${
      danger ? "bg-red-50 border-red-200" : "bg-white"
    }`}
  >
    <p className="text-xs text-gray-500">
      {label}
    </p>
    <p
      className={`text-lg font-bold ${
        danger ? "text-red-600" : ""
      }`}
    >
      {value}
    </p>

    {badge && (
      <span className="inline-block mt-1 text-xs bg-gray-200 px-2 py-0.5 rounded">
        {value}
      </span>
    )}
  </div>
);

const SkeletonCard = () => (
  <div className="p-4 border rounded-xl">
    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-5 bg-gray-200 rounded w-3/4" />
  </div>
);

/* ================= HELPERS ================= */

const formatINR = n =>
  `₹${Number(n || 0).toLocaleString("en-IN")}`;

const formatDate = d =>
  d ? new Date(d).toLocaleDateString("en-IN") : "—";
