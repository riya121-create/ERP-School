import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, ClipboardList, CalendarDays, GraduationCap, Wallet, User, BookOpen, Megaphone } from "lucide-react";
import api from "../../services/api";

import ParentSidebar from "../../components/parent/ParentSidebar";
import ParentOverview from "../../components/parent/ParentOverview";
import ParentAttendance from "../../components/parent/ParentAttendance";
import ParentHomework from "../../components/parent/ParentHomework";
import ParentAnnouncements from "../../components/parent/ParentAnnouncements";
import DarkCard from "../../components/parent/DarkCard";
import Metric from "../../components/parent/Metric";
import InfoRow from "../../components/parent/InfoRow";

export default function ParentDashboardEnhanced() {
  const navigate = useNavigate();

  const [parent,          setParent]          = useState(null);
  const [students,        setStudents]        = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [loading,         setLoading]         = useState(true);

  const [attendance, setAttendance] = useState([]);
  const [timetable,  setTimetable]  = useState([]);
  const [results,    setResults]    = useState(null);
  const [fees,       setFees]       = useState(null);

  const [tab,       setTab]       = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768);

  useEffect(() => {
    const fn = () => { const m = window.innerWidth < 768; setIsMobile(m); if (!m) setCollapsed(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    api.get("/parent/me")
      .then(res => {
        setParent(res.data.parent);
        const list = res.data.students || [];
        setStudents(list);
        setActiveStudentId(res.data.activeStudentId || list[0]?._id || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeStudentId) return;
    setAttendance([]); setTimetable([]); setResults(null); setFees(null);
    Promise.allSettled([
      api.get(`/parent/attendance/${activeStudentId}`),
      api.get(`/parent/timetable/${activeStudentId}`),
      api.get(`/parent/results/${activeStudentId}`),
      api.get(`/parent/fees/${activeStudentId}`),
    ]).then(([a, t, r, f]) => {
      if (a.status === "fulfilled") setAttendance(a.value.data || []);
      if (t.status === "fulfilled") setTimetable(t.value.data  || []);
      if (r.status === "fulfilled") setResults(r.value.data    || null);
      if (f.status === "fulfilled") setFees(f.value.data       || null);
    });
  }, [activeStudentId]);

  const now      = new Date();
  const monthKey = now.toISOString().slice(0, 7);
  const monthAtt = attendance.filter(a => a.date?.startsWith(monthKey));
  const stats    = useMemo(() => {
    const total   = monthAtt.length;
    const present = monthAtt.filter(a => a.status === "present").length;
    return { total, present, absent: total - present,
             percent: total ? Math.round((present / total) * 100) : 0 };
  }, [monthAtt]);

  const activeStudent = students.find(s => s._id === activeStudentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex">
      <ParentSidebar
        parent={parent}
        students={students}
        activeStudentId={activeStudentId}
        setActiveStudentId={id => { setActiveStudentId(id); setTab("overview"); }}
        tab={tab} setTab={setTab}
        collapsed={collapsed} isMobile={isMobile}
        onToggle={() => setCollapsed(c => !c)}
        navigate={navigate}
      />

      <main className={`flex-1 min-h-screen p-6 md:p-8 overflow-y-auto transition-all duration-300
        ${collapsed ? "md:ml-20" : "md:ml-72"}`}>

        {tab === "overview" && (
          <ParentOverview
            parent={parent}
            activeStudent={activeStudent}
            stats={stats}
            results={results}
            timetable={timetable}
          />
        )}

        {tab === "attendance" && (
          <ParentAttendance stats={stats} monthAtt={monthAtt} />
        )}

        {tab === "timetable" && (
          <DarkCard title="Weekly Timetable">
            {timetable.length === 0 ? (
              <p className="text-sm text-gray-500">No timetable published yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {timetable.map(day => (
                  <div key={day._id} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4">
                    <h4 className="font-semibold text-gray-200 mb-3">{day.day}</h4>
                    {day.periods.map((p, i) => (
                      <div key={i} className="bg-white/[0.04] rounded-lg p-2.5 mb-2 text-sm">
                        <p className="font-medium text-gray-200">{p.subject}</p>
                        <p className="text-xs text-gray-500">{p.startTime} - {p.endTime}</p>
                        <p className="text-xs text-gray-600">{p.teacherId?.name || "-"}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </DarkCard>
        )}

        {tab === "results" && (
          <div className="space-y-6">
            {!results ? (
              <DarkCard title="Results"><p className="text-sm text-gray-500">No published results yet.</p></DarkCard>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Metric title="Total Marks"  value={results.summary.totalMarks}    accent="indigo" />
                  <Metric title="Max Marks"    value={results.summary.totalMaxMarks} accent="amber" />
                  <Metric title="Overall %"    value={`${results.summary.overallPercent}%`} accent="emerald" />
                  <Metric title="Result"       value={results.summary.overallResult}
                    accent={results.summary.overallResult === "PASS" ? "emerald" : "rose"} />
                </div>

                {Object.entries(results.exams || {}).map(([type, list]) => (
                  <DarkCard key={type} title={`${type} Exams`}>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] uppercase tracking-widest text-gray-600 border-b border-white/[0.06]">
                            <th className="text-left pb-3 pr-4">Exam</th>
                            <th className="text-left pb-3 pr-4">Subject</th>
                            <th className="text-center pb-3 pr-4">Marks</th>
                            <th className="text-center pb-3 pr-4">Max</th>
                            <th className="text-center pb-3 pr-4">%</th>
                            <th className="text-center pb-3">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                          {list.map((r, i) => (
                            <tr key={i} className="text-gray-300">
                              <td className="py-3 pr-4 font-medium">{r.name}</td>
                              <td className="py-3 pr-4 text-gray-400">{r.subject}</td>
                              <td className="py-3 pr-4 text-center font-semibold">
                                <span className={r.marks === "AB" ? "text-amber-400" : "text-white"}>{r.marks}</span>
                              </td>
                              <td className="py-3 pr-4 text-center text-gray-500">{r.maxMarks}</td>
                              <td className="py-3 pr-4 text-center">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${r.percentage >= 75 ? "bg-emerald-500/20 text-emerald-400" :
                                    r.percentage >= 33 ? "bg-amber-500/20 text-amber-400" :
                                    "bg-rose-500/20 text-rose-400"}`}>
                                  {r.percentage}%
                                </span>
                              </td>
                              <td className="py-3 text-center">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full
                                  ${r.result === "PASS" || r.result === "PRESENT"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : r.result === "AB" || r.result === "ABSENT"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : "bg-rose-500/20 text-rose-400"}`}>
                                  {r.result || "-"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DarkCard>
                ))}
              </>
            )}
          </div>
        )}

        {tab === "homework" && (
          <ParentHomework activeStudentId={activeStudentId} />
        )}

        {tab === "announcements" && (
          <ParentAnnouncements activeStudentId={activeStudentId} />
        )}

        {tab === "fees" && (
          <div className="space-y-6">
            {!fees ? (
              <DarkCard title="Fees"><p className="text-sm text-gray-500">Loading fee details...</p></DarkCard>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Metric title="Monthly Tuition" value={`₹${fees.tuition?.monthly?.toLocaleString() || 0}`} accent="indigo" />
                  <Metric title="Annual Tuition"  value={`₹${fees.tuition?.annual?.toLocaleString()  || 0}`} accent="amber" />
                  <Metric title="Total Monthly"   value={`₹${fees.total?.monthly?.toLocaleString()   || 0}`} accent="emerald" />
                </div>

                <DarkCard title="Fee Breakdown">
                  <div className="space-y-3">
                    {(fees.components || []).map((c, i) => (
                      <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-200">{c.name}</p>
                          <p className="text-xs text-gray-600">{c.frequency}{c.optional ? " · Optional" : ""}{c.refundable ? " · Refundable" : ""}</p>
                        </div>
                        <p className="text-sm font-semibold text-indigo-400">₹{c.amount?.toLocaleString()}</p>
                      </div>
                    ))}
                    {(fees.components || []).length === 0 && (
                      <p className="text-sm text-gray-500">No fee components configured.</p>
                    )}
                  </div>
                </DarkCard>

                {fees.transport?.enabled && (
                  <DarkCard title="Transport Fee">
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoRow label="Mode"        value={fees.transport.mode} />
                      {fees.transport.stopName   && <InfoRow label="Stop"         value={fees.transport.stopName} />}
                      {fees.transport.vehicleNo  && <InfoRow label="Vehicle No"   value={fees.transport.vehicleNo} />}
                      {fees.transport.routeName  && <InfoRow label="Route"        value={fees.transport.routeName} />}
                      {fees.transport.pickupTime && <InfoRow label="Pickup Time"  value={fees.transport.pickupTime} />}
                      <InfoRow label="Monthly Fee" value={`₹${fees.transport.monthly?.toLocaleString()}`} />
                      <InfoRow label="Annual Fee"  value={`₹${fees.transport.annual?.toLocaleString()}`} />
                    </div>
                  </DarkCard>
                )}
              </>
            )}
          </div>
        )}

        {tab === "profile" && (
          <DarkCard title="Parent Profile">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <InfoRow label="Name"     value={parent?.name} />
              <InfoRow label="Phone"    value={parent?.phone} />
              <InfoRow label="Children" value={students.length} />
            </div>
          </DarkCard>
        )}
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#111111] border-t border-white/[0.06] flex justify-around py-3 z-50">
        {[
          { id: "overview",      icon: <LayoutDashboard size={20} /> },
          { id: "attendance",    icon: <ClipboardList size={20} /> },
          { id: "timetable",     icon: <CalendarDays size={20} /> },
          { id: "results",       icon: <GraduationCap size={20} /> },
          { id: "homework",      icon: <BookOpen size={20} /> },
          { id: "fees",          icon: <Wallet size={20} /> },
          { id: "announcements", icon: <Megaphone size={20} /> },
          { id: "profile",       icon: <User size={20} /> },
        ].map(({ id, icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`transition ${tab === id ? "text-indigo-400" : "text-gray-600 hover:text-gray-400"}`}>
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
