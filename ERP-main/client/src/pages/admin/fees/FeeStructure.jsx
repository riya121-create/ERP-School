import { useState, useMemo, useEffect } from "react";
import api from "@/services/api";
import FeeExplore from "./FeeExplore";
import { Plus, Trash2, Save, Bus, BarChart2, BookOpen, ChevronDown } from "lucide-react";

export default function FeeStructure() {
  const [mode, setMode] = useState("class");
  const [sections, setSections] = useState([]);
  const [classes, setClasses]   = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [basicInfo, setBasicInfo] = useState({ session: "", className: "", section: "", classId: "", structureName: "" });
  const [components, setComponents] = useState([{ name: "Tuition Fee", amount: "", frequency: "Monthly", refundable: false, optional: false }]);
  const [transportConfig, setTransportConfig] = useState({ feeMode: "TRANSPORT", vehicleId: "", transportFee: "", stopFees: {}, stopNames: {} });
  const [studentFee, setStudentFee] = useState({ studentId: "", overrideAmount: "", reason: "" });

  useEffect(() => {
    api.get("/admin/classes").then(r => setClasses(r.data || [])).catch(() => {});
    api.get("/admin/transport").then(r => setVehicles(r.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (basicInfo.session && basicInfo.className && basicInfo.section)
      setBasicInfo(p => ({ ...p, structureName: `${p.className}-${p.section} (${p.session})` }));
  }, [basicInfo.session, basicInfo.className, basicInfo.section]);

  const selectedVehicle = vehicles.find(v => v._id === transportConfig.vehicleId);

  const componentBreakdown = useMemo(() => components.map(c => ({
    name: c.name || "Unnamed", frequency: c.frequency,
    monthly: c.frequency === "Monthly" ? Number(c.amount || 0) : 0,
    annual:  c.frequency === "Monthly" ? Number(c.amount || 0) * 12 : Number(c.amount || 0),
  })), [components]);

  const monthlyTotal = useMemo(() => {
    const comp = componentBreakdown.reduce((s, c) => s + c.monthly, 0);
    const trans = transportConfig.vehicleId && transportConfig.feeMode === "TRANSPORT" ? Number(transportConfig.transportFee || 0) : 0;
    return comp + trans;
  }, [componentBreakdown, transportConfig]);

  const annualTotal = useMemo(() => {
    const comp = componentBreakdown.reduce((s, c) => s + c.annual, 0);
    const trans = transportConfig.vehicleId && transportConfig.feeMode === "TRANSPORT" ? Number(transportConfig.transportFee || 0) * 12 : 0;
    return comp + trans;
  }, [componentBreakdown, transportConfig]);

  const addComponent = () => setComponents(p => [...p, { name: "", amount: "", frequency: "Monthly", refundable: false, optional: false }]);
  const removeComponent = i => setComponents(p => p.filter((_, x) => x !== i));
  const updateComponent = (i, f, v) => setComponents(p => p.map((c, x) => x === i ? { ...c, [f]: v } : c));

  const handleSave = async () => {
    if (!basicInfo.classId) return alert("Please select a class");
    if (!basicInfo.section)  return alert("Please select a section");
    if (!basicInfo.session)  return alert("Please enter session");
    if (components.length === 0) return alert("Add at least one fee component");
    if (transportConfig.feeMode === "STOP" && Object.keys(transportConfig.stopFees || {}).length === 0)
      return alert("Please enter stop-wise transport fees");

    const normalizedTransport = transportConfig.feeMode === "STOP"
      ? { ...transportConfig, stopFees: Object.fromEntries(Object.entries(transportConfig.stopFees).map(([k, v]) => [k, Number(v)])) }
      : transportConfig;

    try {
      await api.post("/admin/fees/structure", {
        classId: basicInfo.classId, className: basicInfo.className,
        section: basicInfo.section, session: basicInfo.session,
        structureName: basicInfo.structureName, status: "ACTIVE",
        components, transportConfig: normalizedTransport,
        financeSummary: { monthlyBase: monthlyTotal, annualBase: annualTotal },
      });
      alert("Fee structure saved ✅");
    } catch (err) {
      alert(err.response?.data?.message || "Save failed");
    }
  };

  const TABS = [
    { key: "class",   label: "Class Fee Structure", icon: <BookOpen size={14} /> },
    { key: "student", label: "Student Override",     icon: <ChevronDown size={14} /> },
    { key: "explore", label: "Fee Explorer",         icon: <BarChart2 size={14} /> },
  ];

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Fee Structure Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure class-level fees, transport rules & overrides</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setMode(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition
              ${mode === t.key
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08] hover:text-gray-200"
              }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ===== CLASS MODE ===== */}
      {mode === "class" && (
        <div className="space-y-4">

          {/* Structure Details */}
          <Card title="Structure Details">
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Academic Session *">
                <DI placeholder="e.g. 2024-25" value={basicInfo.session}
                  onChange={e => setBasicInfo(p => ({ ...p, session: e.target.value }))} />
              </Field>
              <Field label="Class *">
                <DS value={basicInfo.className} onChange={e => {
                  const sel = classes.find(c => c.name === e.target.value);
                  const secs = [...new Set(classes.filter(c => c.name === sel?.name).map(c => c.section).filter(Boolean))];
                  setBasicInfo(p => ({ ...p, className: sel?.name || "", classId: sel?._id || "", section: "", structureName: "" }));
                  setSections(secs);
                  setTransportConfig({ feeMode: "TRANSPORT", vehicleId: "", transportFee: "", stopFees: {}, stopNames: {} });
                }}>
                  <option value="" className="bg-[#1a1a1a]">Select Class</option>
                  {[...new Set(classes.map(c => c.name))].map(n => <option key={n} value={n} className="bg-[#1a1a1a]">{n}</option>)}
                </DS>
              </Field>
              <Field label="Section *">
                <DS value={basicInfo.section} disabled={!sections.length}
                  onChange={e => setBasicInfo(p => ({ ...p, section: e.target.value }))}>
                  <option value="" className="bg-[#1a1a1a]">Select Section</option>
                  {sections.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">Section {s}</option>)}
                </DS>
              </Field>
            </div>
            {basicInfo.structureName && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium">
                {basicInfo.structureName}
              </div>
            )}
          </Card>

          {/* Fee Components */}
          <Card title="Fee Components" action={
            <button onClick={addComponent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 text-xs font-semibold transition">
              <Plus size={13} /> Add Component
            </button>
          }>
            <div className="space-y-2">
              {/* header */}
              <div className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.8fr_auto] gap-3 px-3 py-2 bg-white/[0.03] rounded-lg text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                <span>Name</span><span>Amount (₹)</span><span>Frequency</span>
                <span className="text-center">Optional</span><span className="text-center">Refundable</span><span />
              </div>
              {components.map((c, i) => (
                <div key={i} className="grid grid-cols-[2fr_1.2fr_1fr_0.8fr_0.8fr_auto] gap-3 items-center px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                  <DI placeholder="Component name" value={c.name} onChange={e => updateComponent(i, "name", e.target.value)} />
                  <DI type="number" placeholder="0" value={c.amount} onChange={e => updateComponent(i, "amount", e.target.value)} />
                  <DS value={c.frequency} onChange={e => updateComponent(i, "frequency", e.target.value)}>
                    <option className="bg-[#1a1a1a]">Monthly</option>
                    <option className="bg-[#1a1a1a]">One Time</option>
                  </DS>
                  <div className="flex justify-center">
                    <input type="checkbox" checked={c.optional} onChange={() => updateComponent(i, "optional", !c.optional)} className="accent-indigo-500 w-4 h-4" />
                  </div>
                  <div className="flex justify-center">
                    <input type="checkbox" checked={c.refundable} onChange={() => updateComponent(i, "refundable", !c.refundable)} className="accent-indigo-500 w-4 h-4" />
                  </div>
                  <button onClick={() => removeComponent(i)} className="p-1 rounded text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Transport */}
          <Card title="Transport Fee" icon={<Bus size={14} className="text-indigo-400" />}>
            {/* mode toggle */}
            <div className="flex gap-3 mb-4">
              {[["TRANSPORT","Class Level (Fixed)"],["STOP","Stop Wise (Per Student)"]].map(([m, label]) => (
                <button key={m} onClick={() => setTransportConfig(p => ({ ...p, feeMode: m }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition
                    ${transportConfig.feeMode === m
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08]"
                    }`}>
                  {label}
                </button>
              ))}
            </div>

            {/* route select */}
            <Field label="Route / Vehicle">
              <DS value={transportConfig.vehicleId}
                onChange={e => setTransportConfig(p => ({ ...p, vehicleId: e.target.value, stopFees: {}, stopNames: {} }))}>
                <option value="" className="bg-[#1a1a1a]">Select Route</option>
                {vehicles.map(v => <option key={v._id} value={v._id} className="bg-[#1a1a1a]">{v.vehicleNo} – {v.route?.routeName}</option>)}
              </DS>
            </Field>

            {/* transport wise */}
            {transportConfig.feeMode === "TRANSPORT" && (
              <div className="mt-3">
                <Field label="Monthly Transport Fee (₹)">
                  <DI type="number" placeholder="0" value={transportConfig.transportFee} disabled={!transportConfig.vehicleId}
                    onChange={e => setTransportConfig(p => ({ ...p, transportFee: e.target.value }))} />
                </Field>
              </div>
            )}

            {/* stop wise */}
            {transportConfig.feeMode === "STOP" && selectedVehicle?.route?.stops && (
              <div className="mt-3 rounded-xl border border-white/[0.07] overflow-hidden">
                <div className="grid grid-cols-2 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                  <span>Stop Name</span><span>Monthly Fee (₹)</span>
                </div>
                {selectedVehicle.route.stops.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-2 px-4 py-2.5 border-b border-white/[0.04] items-center">
                    <span className="text-sm text-gray-300">{s.stopName}</span>
                    <DI type="number" placeholder="0" value={transportConfig.stopFees[idx] ?? ""}
                      onChange={e => setTransportConfig(p => ({
                        ...p,
                        stopFees: { ...p.stopFees, [idx]: e.target.value },
                        stopNames: { ...p.stopNames, [idx]: s.stopName },
                      }))} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Finance Summary */}
          <Card title="Finance Summary" icon={<BarChart2 size={14} className="text-emerald-400" />}>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Monthly Base</p>
                <p className="text-2xl font-bold text-emerald-400">₹{monthlyTotal.toLocaleString("en-IN")}</p>
              </div>
              <div className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Annual Base</p>
                <p className="text-2xl font-bold text-indigo-400">₹{annualTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* breakdown table */}
            <div className="rounded-xl border border-white/[0.07] overflow-hidden">
              <div className="grid grid-cols-4 px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-gray-600">
                <span>Component</span><span>Frequency</span><span>Monthly</span><span>Annual</span>
              </div>
              {componentBreakdown.map((c, i) => (
                <div key={i} className="grid grid-cols-4 px-4 py-2.5 border-b border-white/[0.04] text-sm">
                  <span className="text-gray-200">{c.name}</span>
                  <span className="text-gray-500">{c.frequency}</span>
                  <span className="text-gray-300">₹{c.monthly.toLocaleString("en-IN")}</span>
                  <span className="text-gray-300">₹{c.annual.toLocaleString("en-IN")}</span>
                </div>
              ))}
              {transportConfig.vehicleId && (
                <div className="grid grid-cols-4 px-4 py-2.5 text-sm bg-indigo-500/5">
                  <span className="text-indigo-400">Transport</span>
                  <span className="text-gray-500">Monthly</span>
                  <span className="text-indigo-400">{transportConfig.feeMode === "TRANSPORT" ? `₹${Number(transportConfig.transportFee||0).toLocaleString("en-IN")}` : "Per Stop"}</span>
                  <span className="text-indigo-400">{transportConfig.feeMode === "TRANSPORT" ? `₹${(Number(transportConfig.transportFee||0)*12).toLocaleString("en-IN")}` : "Per Stop"}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={!basicInfo.classId || !basicInfo.section}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-semibold transition">
              <Save size={15} /> Save Fee Structure
            </button>
          </div>
        </div>
      )}

      {/* ===== STUDENT OVERRIDE ===== */}
      {mode === "student" && (
        <Card title="Student Fee Override">
          <div className="space-y-3 max-w-md">
            <Field label="Student ID"><DI placeholder="Enter student ID" value={studentFee.studentId} onChange={e => setStudentFee(p => ({ ...p, studentId: e.target.value }))} /></Field>
            <Field label="Override Amount (₹)"><DI type="number" placeholder="0" value={studentFee.overrideAmount} onChange={e => setStudentFee(p => ({ ...p, overrideAmount: e.target.value }))} /></Field>
            <Field label="Reason *">
              <textarea value={studentFee.reason} onChange={e => setStudentFee(p => ({ ...p, reason: e.target.value }))} rows={3} placeholder="Mandatory reason for override…"
                className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition resize-none" />
            </Field>
            <button className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition">
              <Save size={14} /> Apply Override
            </button>
          </div>
        </Card>
      )}

      {/* ===== EXPLORE ===== */}
      {mode === "explore" && <FeeExplore />}
    </div>
  );
}

/* ===== HELPERS ===== */
function Card({ title, icon, action, children }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {icon}<span>{title}</span>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return <div><label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>{children}</div>;
}
function DI(props) {
  return <input {...props} className={`w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}`} />;
}
function DS({ children, ...props }) {
  return <select {...props} className={`w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}`}>{children}</select>;
}
