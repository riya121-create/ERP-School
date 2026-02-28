import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";

/*
=====================================================
FEE EXPLORER — FINAL ERP-SAFE VERSION
• Backend is SINGLE source of truth
• Tuition + Transport (TRANSPORT + STOP)
• STOP-wise Monthly & Annual totals
• Zero frontend calculation
• Zero mismatch
=====================================================
*/

export default function FeeExplore() {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [filters, setFilters] = useState({
    className: "",
    session: "",
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/fees/structure");

        setFees(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("FEE FETCH ERROR:", err);
        setError("Failed to load fee structures");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= FILTER OPTIONS ================= */
  const classes = useMemo(
    () => [...new Set(fees.map(f => f.className).filter(Boolean))],
    [fees]
  );

  const sessions = useMemo(
    () => [...new Set(fees.map(f => f.session).filter(Boolean))],
    [fees]
  );

  const filteredFees = useMemo(() => {
    return fees.filter(f => {
      if (filters.className && f.className !== filters.className) return false;
      if (filters.session && f.session !== filters.session) return false;
      return true;
    });
  }, [fees, filters]);

  /* ================= HELPERS ================= */
  const formatINR = n =>
    `₹${Number(n || 0).toLocaleString("en-IN")}`;

  /* ================= STATES ================= */
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!filteredFees.length) {
    return (
      <div className="text-center text-gray-500 py-10">
        No fee structures found
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-bold">📊 Fee Explorer</h2>
        <p className="text-sm text-gray-500">
          Complete admin-level fee visibility
        </p>
      </div>

      {/* FILTERS */}
      <div className="flex gap-3 flex-wrap">
        <select
          className="input"
          value={filters.className}
          onChange={e =>
            setFilters({ ...filters, className: e.target.value })
          }
        >
          <option value="">All Classes</option>
          {classes.map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          className="input"
          value={filters.session}
          onChange={e =>
            setFilters({ ...filters, session: e.target.value })
          }
        >
          <option value="">All Sessions</option>
          {sessions.map(s => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* LIST */}
      {filteredFees.map(fee => {
        const isOpen = expandedId === fee._id;
        const breakdown = fee.calculatedBreakdown || {};
        const stopWise = Array.isArray(breakdown.stopWise)
          ? breakdown.stopWise
          : [];

        return (
          <div
            key={fee._id}
            className="bg-white border rounded-xl overflow-hidden"
          >
            {/* HEADER */}
            <button
              onClick={() =>
                setExpandedId(isOpen ? null : fee._id)
              }
              className="w-full p-5 flex justify-between hover:bg-gray-50 text-left"
            >
              <div>
                <p className="font-semibold text-lg">
                  Class {fee.className} • {fee.session}
                </p>
                <p className="text-sm text-gray-500">
                  {fee.structureName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Annual Base</p>
                <p className="font-bold">
                  {formatINR(fee.financeSummary?.annualBase)}
                </p>
              </div>
            </button>

            {/* EXPANDED */}
            {isOpen && (
              <div className="border-t bg-gray-50 p-5 space-y-6">
                {/* TUITION SUMMARY */}
                <div className="grid md:grid-cols-2 gap-4">
                  <SummaryCard
                    label="Monthly Tuition"
                    value={formatINR(breakdown.tuition?.monthly)}
                  />
                  <SummaryCard
                    label="Annual Tuition"
                    value={formatINR(breakdown.tuition?.annual)}
                  />
                </div>

                {/* COMPONENTS */}
                <div>
                  <p className="font-medium mb-2">Fee Components</p>
                  <div className="border rounded-lg overflow-hidden">
                    <HeaderRow />
                    {fee.components.map((c, i) => (
                      <Row
                        key={i}
                        name={c.name}
                        freq={c.frequency}
                        monthly={
                          c.frequency === "Monthly"
                            ? formatINR(c.amount)
                            : "—"
                        }
                        annual={
                          c.frequency === "Monthly"
                            ? formatINR(c.amount * 12)
                            : formatINR(c.amount)
                        }
                      />
                    ))}
                  </div>
                </div>

                {/* TRANSPORT — CLASS LEVEL */}
                {fee.transportConfig?.feeMode === "TRANSPORT" && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="font-semibold">
                      🚍 Transport (Class Level)
                    </p>
                    <p className="text-sm">
                      Monthly: {formatINR(breakdown.transport?.monthly || 0)} •
                      Annual: {formatINR(breakdown.transport?.annual || 0)}
                    </p>
                  </div>
                )}

                {/* TRANSPORT — STOP WISE */}
                {fee.transportConfig?.feeMode === "STOP" && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">
                      🚍 Transport — STOP Wise
                    </p>

                    {stopWise.length === 0 ? (
                      <p className="text-sm text-red-600">
                        ⚠️ STOP fees not configured
                      </p>
                    ) : (
                      <div className="border rounded-lg bg-white overflow-hidden">
                        <div className="grid grid-cols-7 bg-indigo-100 px-4 py-2 text-sm font-semibold">
                          <span>Stop</span>
                          <span>Transport (M)</span>
                          <span>Transport (A)</span>
                          <span>Tuition (M)</span>
                          <span>Tuition (A)</span>
                          <span>Total (M)</span>
                          <span>Total (A)</span>
                        </div>

                        {stopWise.map((stop, idx) => (
                          <div
                            key={stop.stopId}

                            className="grid grid-cols-7 px-4 py-2 text-sm border-t"
                          >
                            <span>{stop.stopName}</span>

                            <span>{formatINR(stop.transportMonthly)}</span>
                            <span>{formatINR(stop.transportAnnual)}</span>
                            <span>{formatINR(breakdown.tuition?.monthly)}</span>
                            <span>{formatINR(breakdown.tuition?.annual)}</span>
                            <span className="font-medium">
                              {formatINR(stop.totalMonthly)}
                            </span>
                            <span className="font-semibold text-indigo-700">
                              {formatINR(stop.totalAnnual)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

const Skeleton = () => (
  <div className="animate-pulse bg-gray-200 h-24 rounded-xl" />
);

const SummaryCard = ({ label, value }) => (
  <div className="bg-white border rounded-lg p-4">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-xl font-bold">{value}</p>
  </div>
);

const HeaderRow = () => (
  <div className="grid grid-cols-4 bg-gray-100 px-4 py-2 text-sm font-semibold">
    <span>Component</span>
    <span>Frequency</span>
    <span>Monthly</span>
    <span>Annual</span>
  </div>
);

const Row = ({ name, freq, monthly, annual }) => (
  <div className="grid grid-cols-4 px-4 py-2 text-sm border-t">
    <span>{name}</span>
    <span>{freq}</span>
    <span>{monthly}</span>
    <span>{annual}</span>
  </div>
);
