import { useEffect, useState } from "react";
import api from "@/services/api";

/* =====================================================
   👨‍👩‍👧 PARENT FEES — FINAL ERP SAFE VERSION
   • Backend = source of truth
   • Class + Section based fee
   • Transport: OFF / TRANSPORT / STOP
===================================================== */

export default function ParentFees({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ================= FETCH ================= */
  useEffect(() => {
    if (!studentId) return;

    setLoading(true);
    setError("");

    api
      .get(`/parent/fees/${studentId}`)
      .then(res => {
        setData(res.data);
      })
      .catch(err => {
        console.error("PARENT FEES ERROR:", err);
        setError(
          err?.response?.data?.message ||
          "Failed to load fee details"
        );
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  /* ================= HELPERS ================= */
  const INR = n =>
    `₹${Number(n || 0).toLocaleString("en-IN")}`;

  /* ================= STATES ================= */
  if (loading) {
    return (
      <Card title="💰 Fees">
        <p className="text-sm text-gray-500">
          Loading fee details…
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="💰 Fees">
        <p className="text-sm text-red-600">
          {error}
        </p>
      </Card>
    );
  }

  if (!data) return null;

  const { student, tuition, transport, total } = data;

  /* ================= UI ================= */
  return (
    <Card title="💰 Fee Details">
      {/* ===== STUDENT INFO ===== */}
      {student && (
        <div className="mb-5 text-sm text-gray-600">
          <p className="font-medium text-gray-800">
            {student.name}
          </p>
          <p>
            Class {student.className} – Section {student.section}
          </p>
        </div>
      )}

      {/* ===== MONTHLY SUMMARY ===== */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Summary
          label="Tuition (Monthly)"
          value={INR(tuition.monthly)}
        />

        <Summary
          label="Transport (Monthly)"
          value={
            transport?.enabled
              ? INR(transport.monthly)
              : "—"
          }
        />

        <Summary
          label="Total Monthly"
          value={INR(total.monthly)}
          highlight
        />
      </div>

      {/* ===== ANNUAL SUMMARY ===== */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Summary
          label="Tuition (Annual)"
          value={INR(tuition.annual)}
        />

        <Summary
          label="Transport (Annual)"
          value={
            transport?.enabled
              ? INR(transport.annual)
              : "—"
          }
        />

        <Summary
          label="Total Annual"
          value={INR(total.annual)}
          highlight
        />
      </div>

      {/* ===== TRANSPORT DETAILS ===== */}
      <div className="border-t pt-4">
        <h3 className="font-semibold mb-3">
          🚍 Transport Details
        </h3>

        {!transport?.enabled ? (
          <p className="text-sm text-gray-500">
            Transport service is not enabled for this student.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3 text-sm">
            <Info label="Mode" value={transport.mode} />

            {transport.mode === "STOP" && (
              <Info
                label="Stop"
                value={transport.stopName || "—"}
              />
            )}

            <Info
              label="Route"
              value={transport.routeName || "—"}
            />

            <Info
              label="Vehicle"
              value={transport.vehicleNo || "—"}
            />

            <Info
              label="Pickup Time"
              value={transport.pickupTime || "—"}
            />
          </div>
        )}
      </div>

      {/* ===== FOOT NOTE ===== */}
      <p className="text-xs text-gray-500 mt-6">
        Fees shown are system-calculated based on the
        school fee structure. For corrections, please
        contact the school office.
      </p>
    </Card>
  );
}

/* ================= UI ATOMS ================= */

function Card({ title, children }) {
  return (
    <section className="bg-white rounded-2xl border p-5">
      <h2 className="text-lg font-semibold mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Summary({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "bg-indigo-50 border-indigo-400"
          : "bg-gray-50"
      }`}
    >
      <p className="text-xs uppercase text-gray-500">
        {label}
      </p>
      <p
        className={`text-xl font-bold ${
          highlight ? "text-indigo-700" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">
        {value ?? "—"}
      </span>
    </div>
  );
}
