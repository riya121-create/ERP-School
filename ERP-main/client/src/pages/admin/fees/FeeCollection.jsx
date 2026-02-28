import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import StudentFeeProfile from "./StudentFeeProfile";

/*
=====================================================
FEE COLLECTION — FAANG / REAL COUNTER VERSION
• Class pre-selected → no class shown in list
• Search-first student identification
• Zero confusion UX for admin
• Mobile-first, fast, safe
=====================================================
*/

export default function FeeCollection() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [fee, setFee] = useState(null);

  const [search, setSearch] = useState("");

  const [payment, setPayment] = useState({
    amount: "",
    paymentMode: "CASH",
    referenceNo: ""
  });

  const [loading, setLoading] = useState(false);

  /* ================= LOAD CLASSES ================= */
  useEffect(() => {
    api.get("/admin/classes").then(res => {
      setClasses(res.data || []);
    });
  }, []);

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!classId) return;

    setStudents([]);
    setSelectedStudent(null);
    setFee(null);
    setSearch("");

    api
      .get(`/admin/classes/${classId}/students`)
      .then(res => setStudents(res.data || []));
  }, [classId]);

  /* ================= SEARCH FILTER ================= */
  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return students;

    return students.filter(s =>
      s.name?.toLowerCase().includes(q) ||
      s.admissionNo?.toLowerCase().includes(q) ||
      s.rollNo?.toString().includes(q) ||
      s.parentPhone?.includes(q)

    );
  }, [students, search]);

  /* ================= LOAD FEE ================= */
  const selectStudent = async s => {
    setSelectedStudent(s);
    const res = await api.get(`/admin/fees/student/${s._id}`);
    setFee(res.data);

    setPayment(p => ({
      ...p,
      amount: res.data.totalDue,
      referenceNo: ""
    }));
  };

  /* ================= PAY ================= */
  const collectFee = async () => {
    if (!payment.amount) {
      alert("Amount required");
      return;
    }

    setLoading(true);
    await api.post("/admin/fees/pay", {
      studentId: selectedStudent._id,
      ...payment
    });
    setLoading(false);

    alert("Fee collected successfully ✅");
    selectStudent(selectedStudent);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          💳 Fee Collection Counter
        </h1>
        <p className="text-sm text-gray-500">
          Select class → search student → verify → collect fee
        </p>
      </div>

      {/* CLASS SELECT */}
      <select
        className="input"
        value={classId}
        onChange={e => setClassId(e.target.value)}
      >
        <option value="">Select Class</option>
        {classes.map(c => (
          <option key={c._id} value={c._id}>
            Class {c.name} - {c.section}
          </option>
        ))}
      </select>

      {/* SEARCH */}
      {students.length > 0 && (
        <input
          className="input"
          placeholder="Search name / roll / admission / parent phone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}

      {/* STUDENT LIST (CLEAN, NO CLASS) */}
      {filteredStudents.length > 0 && (
        <div className="bg-white border rounded-2xl overflow-hidden">

          <div className="bg-gray-100 px-4 py-2 font-semibold text-sm">
            Students — verify identity carefully
          </div>

          {filteredStudents.map(s => (
            <button
              key={s._id}
              onClick={() => selectStudent(s)}
              className={`w-full text-left px-4 py-3 border-t transition
                hover:bg-gray-50
                ${selectedStudent?._id === s._id && "bg-blue-50 ring-1 ring-blue-200"}
              `}
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-2">

                {/* STUDENT */}
                <div>
                  <p className="font-semibold">
                    {s.rollNo ? `${s.rollNo}. ` : ""}
                    {s.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    Admission No:{" "}
                    <span className="font-medium">
                      {s.admissionNo || "—"}
                    </span>
                  </p>
                </div>

                {/* PARENT */}
                <div className="text-sm text-gray-600 md:text-right">
                  <p className="font-medium">
                Parent: {s.parentName || "—"}

                  </p>
                  <p className="font-mono">
        📞 {s.parentPhone || "—"}
                  </p>
                </div>

              </div>
            </button>
          ))}
        </div>
      )}
{/* ================= STUDENT FEE PROFILE ================= */}
{selectedStudent && (
  <div className="mt-8">
    <StudentFeeProfile studentId={selectedStudent._id} />
  </div>
)}

      {/* FEE SNAPSHOT */}
      {fee && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Annual Fee" value={`₹${fee.totalAnnual}`} />
          <Stat label="Paid" value={`₹${fee.totalPaid}`} />
          <Stat label="Due" value={`₹${fee.totalDue}`} danger />
          <Stat label="Status" value={fee.status} badge />
        </div>
      )}

      {/* PAYMENT */}
      {fee && fee.totalDue > 0 && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold text-lg">
            Collect Payment
          </h2>

          <input
            type="number"
            className="input text-xl font-bold"
            value={payment.amount}
            onChange={e =>
              setPayment({ ...payment, amount: e.target.value })
            }
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {["CASH", "UPI", "BANK", "ONLINE"].map(m => (
              <button
                key={m}
                onClick={() =>
                  setPayment({ ...payment, paymentMode: m })
                }
                className={`py-2 rounded-xl border font-medium transition
                  ${payment.paymentMode === m
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"}
                `}
              >
                {m}
              </button>
            ))}
          </div>

          {payment.paymentMode !== "CASH" && (
            <input
              className="input"
              placeholder="Reference No"
              value={payment.referenceNo}
              onChange={e =>
                setPayment({ ...payment, referenceNo: e.target.value })
              }
            />
          )}

          <button
            onClick={collectFee}
            disabled={loading}
            className="btn-primary w-full text-lg"
          >
            {loading ? "Processing..." : "✅ Collect Fee"}
          </button>
        </div>
      )}

      {/* NO DUE */}
      {fee && fee.totalDue === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          🎉 Fee already cleared for this session
        </div>
      )}
    </div>
  );
}

/* ================= SMALL UI ================= */

const Stat = ({ label, value, danger, badge }) => (
  <div className={`border rounded-xl p-4 ${danger && "bg-red-50"}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-lg font-bold ${danger && "text-red-600"}`}>
      {value}
    </p>
    {badge && (
      <span className="inline-block mt-1 text-xs bg-gray-200 px-2 py-0.5 rounded">
        {value}
      </span>
    )}
  </div>
);
