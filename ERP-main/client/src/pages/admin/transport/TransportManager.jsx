import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import {
  Bus, Plus, ChevronDown, ChevronUp, MapPin,
  Clock, User, Phone, Navigation, Route,
  Truck, Car, CheckCircle, Save
} from "lucide-react";

/* =====================================================
   MAIN
===================================================== */
export default function TransportManager() {
  const [tab, setTab] = useState("vehicles");

  return (
    <div className="space-y-5 text-gray-100">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Transport Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">Vehicles · Routes · Stops · Scheduling</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2">
        {[
          { key: "vehicles",    label: "Vehicles",    icon: <Bus size={14} /> },
          { key: "assignments", label: "Assignments", icon: <Route size={14} /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition
              ${tab === t.key
                ? "bg-indigo-600 border-indigo-500 text-white"
                : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08] hover:text-gray-200"
              }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "vehicles"    && <VehicleSection />}
      {tab === "assignments" && <AssignmentSection />}
    </div>
  );
}

/* =====================================================
   VEHICLE SECTION
===================================================== */
function VehicleSection() {
  const [vehicles, setVehicles] = useState([]);
  const [openId, setOpenId]     = useState(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm] = useState({
    vehicleNo: "", vehicleType: "Bus", capacity: "",
    driverName: "", driverPhone: "",
  });

  useEffect(() => {
    api.get("/admin/transport").then(r => setVehicles(r.data || []));
  }, []);

  const stats = useMemo(() => ({
    total: vehicles.length,
    bus:   vehicles.filter(v => v.vehicleType === "Bus").length,
    van:   vehicles.filter(v => v.vehicleType === "Van").length,
    auto:  vehicles.filter(v => v.vehicleType === "Auto").length,
  }), [vehicles]);

  const addVehicle = async () => {
    if (!form.vehicleNo || !form.capacity) return alert("Vehicle No & Capacity required");
    setSaving(true);
    try {
      const res = await api.post("/admin/transport", {
        vehicleNo: form.vehicleNo, vehicleType: form.vehicleType,
        capacity: Number(form.capacity),
        driver: { name: form.driverName, phone: form.driverPhone },
      });
      setVehicles(p => [res.data, ...p]);
      setForm({ vehicleNo: "", vehicleType: "Bus", capacity: "", driverName: "", driverPhone: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add vehicle");
    } finally {
      setSaving(false);
    }
  };

  const VEHICLE_ICONS = { Bus: <Bus size={16} />, Van: <Truck size={16} />, Auto: <Car size={16} /> };

  return (
    <div className="space-y-5">

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Bus size={15} />}   label="Total"  value={stats.total} color="indigo" />
        <StatCard icon={<Bus size={15} />}   label="Buses"  value={stats.bus}   color="sky"    />
        <StatCard icon={<Truck size={15} />} label="Vans"   value={stats.van}   color="violet" />
        <StatCard icon={<Car size={15} />}   label="Autos"  value={stats.auto}  color="amber"  />
      </div>

      {/* ADD VEHICLE */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Plus size={13} className="text-indigo-400" /> Add Vehicle
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Field label="Vehicle No *">
            <DI placeholder="e.g. RJ14-AB-1234" value={form.vehicleNo}
              onChange={e => setForm(p => ({ ...p, vehicleNo: e.target.value }))} />
          </Field>
          <Field label="Type">
            <DS value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}>
              <option className="bg-[#1a1a1a]">Bus</option>
              <option className="bg-[#1a1a1a]">Van</option>
              <option className="bg-[#1a1a1a]">Auto</option>
            </DS>
          </Field>
          <Field label="Capacity *">
            <DI type="number" placeholder="e.g. 40" value={form.capacity}
              onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
          </Field>
          <Field label="Driver Name">
            <DI placeholder="Driver full name" value={form.driverName}
              onChange={e => setForm(p => ({ ...p, driverName: e.target.value }))} />
          </Field>
          <Field label="Driver Phone">
            <DI placeholder="10-digit number" value={form.driverPhone}
              onChange={e => setForm(p => ({ ...p, driverPhone: e.target.value }))} />
          </Field>
          <Field label=" ">
            <button onClick={addVehicle} disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition mt-0.5">
              <Plus size={14} /> {saving ? "Adding…" : "Add Vehicle"}
            </button>
          </Field>
        </div>
      </div>

      {/* VEHICLE LIST */}
      {vehicles.length === 0 ? (
        <div className="py-16 text-center">
          <Bus size={28} className="text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-600">No vehicles added yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map(v => {
            const open = openId === v._id;
            return (
              <div key={v._id} className="rounded-2xl border border-white/[0.08] bg-[#161616] overflow-hidden">
                {/* row header */}
                <button onClick={() => setOpenId(open ? null : v._id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-400">
                      {VEHICLE_ICONS[v.vehicleType] || <Bus size={16} />}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-sm">{v.vehicleNo}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{v.vehicleType} · Capacity {v.capacity}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {v.route && (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                        <CheckCircle size={11} /> {v.route.routeName}
                      </span>
                    )}
                    {v.driver?.name && (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
                        <User size={11} /> {v.driver.name}
                      </span>
                    )}
                    {open ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                  </div>
                </button>

                {/* expanded */}
                {open && (
                  <div className="border-t border-white/[0.06] p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* vehicle */}
                    <InfoCard title="Vehicle" icon={<Bus size={13} />} color="indigo">
                      <InfoRow label="Number"   value={v.vehicleNo} />
                      <InfoRow label="Type"     value={v.vehicleType} />
                      <InfoRow label="Capacity" value={v.capacity} />
                    </InfoCard>

                    {/* driver */}
                    <InfoCard title="Driver" icon={<User size={13} />} color="sky">
                      <InfoRow label="Name"  value={v.driver?.name  || "—"} />
                      <InfoRow label="Phone" value={v.driver?.phone || "—"} />
                    </InfoCard>

                    {/* route */}
                    <InfoCard title="Route" icon={<Navigation size={13} />} color="violet">
                      {v.route ? (
                        <>
                          <InfoRow label="Route"   value={v.route.routeName} />
                          <InfoRow label="From"    value={v.route.startLocation} />
                          <InfoRow label="To"      value={v.route.endLocation} />
                          <InfoRow label="Morning" value={`${v.route.morningStartTime} – ${v.route.morningEndTime}`} />
                          {v.route.eveningStartTime && (
                            <InfoRow label="Evening" value={`${v.route.eveningStartTime} – ${v.route.eveningEndTime || "—"}`} />
                          )}
                        </>
                      ) : (
                        <p className="text-xs text-gray-600">Not assigned</p>
                      )}
                    </InfoCard>

                    {/* stops */}
                    <InfoCard title="Stops" icon={<MapPin size={13} />} color="emerald">
                      {v.route?.stops?.length ? (
                        <div className="space-y-1.5">
                          {v.route.stops.sort((a, b) => a.order - b.order).map(s => (
                            <div key={s.order} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-2.5 py-1.5 text-xs">
                              <span className="text-gray-300">
                                <span className="text-gray-600 mr-1.5">#{s.order}</span>{s.stopName}
                              </span>
                              <span className="text-gray-600 flex items-center gap-1"><Clock size={10} />{s.pickupTime}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600">No stops</p>
                      )}
                    </InfoCard>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   ASSIGNMENT SECTION
===================================================== */
function AssignmentSection() {
  const [vehicles, setVehicles]         = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [saving, setSaving]             = useState(false);
  const [success, setSuccess]           = useState(false);
  const [route, setRoute] = useState({
    routeName: "", startLocation: "", endLocation: "",
    morningStartTime: "", morningEndTime: "",
    eveningStartTime: "", eveningEndTime: "",
    distanceKm: "", stops: [],
  });

  useEffect(() => {
    api.get("/admin/transport").then(r => setVehicles(r.data || []));
  }, []);

  const vehicle = vehicles.find(v => v._id === selectedVehicle);

  const addStop = () => setRoute(p => ({
    ...p, stops: [...p.stops, { stopName: "", pickupTime: "", order: p.stops.length + 1 }]
  }));

  const updateStop = (i, field, val) => setRoute(p => ({
    ...p, stops: p.stops.map((s, x) => x === i ? { ...s, [field]: val } : s)
  }));

  const removeStop = i => setRoute(p => ({
    ...p, stops: p.stops.filter((_, x) => x !== i).map((s, x) => ({ ...s, order: x + 1 }))
  }));

  const assignRoute = async () => {
    if (!selectedVehicle || !route.routeName || !route.startLocation || !route.endLocation || !route.morningStartTime || !route.morningEndTime)
      return alert("Please fill all required route fields");
    setSaving(true); setSuccess(false);
    try {
      await api.put(`/admin/transport/${selectedVehicle}/route`, route);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign route");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">

      {/* FORM */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Route size={13} className="text-indigo-400" /> Assign Route & Stops
        </p>

        {/* vehicle select */}
        <Field label="Select Vehicle *">
          <DS value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="" className="bg-[#1a1a1a]">Select Transport</option>
            {vehicles.map(v => <option key={v._id} value={v._id} className="bg-[#1a1a1a]">{v.vehicleType} · {v.vehicleNo}</option>)}
          </DS>
        </Field>

        {/* route info */}
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Route Name *"><DI placeholder="e.g. North Route" value={route.routeName} onChange={e => setRoute(p => ({ ...p, routeName: e.target.value }))} /></Field>
          <Field label="Distance (km)"><DI type="number" placeholder="0" value={route.distanceKm} onChange={e => setRoute(p => ({ ...p, distanceKm: e.target.value }))} /></Field>
          <Field label="From *"><DI placeholder="Start location" value={route.startLocation} onChange={e => setRoute(p => ({ ...p, startLocation: e.target.value }))} /></Field>
          <Field label="To *"><DI placeholder="End location" value={route.endLocation} onChange={e => setRoute(p => ({ ...p, endLocation: e.target.value }))} /></Field>
        </div>

        {/* timing */}
        <div>
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wider">Morning Timing *</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start"><DI type="time" value={route.morningStartTime} onChange={e => setRoute(p => ({ ...p, morningStartTime: e.target.value }))} /></Field>
            <Field label="End"><DI type="time" value={route.morningEndTime} onChange={e => setRoute(p => ({ ...p, morningEndTime: e.target.value }))} /></Field>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wider">Evening Timing</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start"><DI type="time" value={route.eveningStartTime} onChange={e => setRoute(p => ({ ...p, eveningStartTime: e.target.value }))} /></Field>
            <Field label="End"><DI type="time" value={route.eveningEndTime} onChange={e => setRoute(p => ({ ...p, eveningEndTime: e.target.value }))} /></Field>
          </div>
        </div>

        {/* stops */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Stops</p>
            <button onClick={addStop}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 text-xs font-semibold transition">
              <Plus size={12} /> Add Stop
            </button>
          </div>
          {route.stops.length === 0 ? (
            <p className="text-xs text-gray-700 py-2">No stops added yet</p>
          ) : (
            <div className="space-y-2">
              {route.stops.map((s, i) => (
                <div key={i} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                  <span className="text-xs text-gray-600 w-6 text-center">#{s.order}</span>
                  <DI placeholder="Stop name" value={s.stopName} onChange={e => updateStop(i, "stopName", e.target.value)} />
                  <DI type="time" value={s.pickupTime} onChange={e => updateStop(i, "pickupTime", e.target.value)} />
                  <button onClick={() => removeStop(i)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition">
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {success && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-sm">
            <CheckCircle size={15} /> Route assigned successfully!
          </div>
        )}

        <button onClick={assignRoute} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition">
          <Save size={14} /> {saving ? "Saving…" : "Assign Route"}
        </button>
      </div>

      {/* LIVE PREVIEW */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#161616] p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Navigation size={13} className="text-indigo-400" /> Live Preview
        </p>

        {!vehicle ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bus size={28} className="text-gray-700 mb-3" />
            <p className="text-sm text-gray-600">Select a vehicle to preview</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* vehicle badge */}
            <div className="flex items-center gap-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Bus size={16} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{vehicle.vehicleNo}</p>
                <p className="text-xs text-gray-500">{vehicle.vehicleType} · Capacity {vehicle.capacity}</p>
              </div>
            </div>

            {/* route details */}
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
              <PreviewRow label="Route"   value={route.routeName || "—"} />
              <PreviewRow label="From"    value={route.startLocation || "—"} />
              <PreviewRow label="To"      value={route.endLocation || "—"} />
              <PreviewRow label="Morning" value={route.morningStartTime ? `${route.morningStartTime} – ${route.morningEndTime}` : "—"} />
              {route.eveningStartTime && (
                <PreviewRow label="Evening" value={`${route.eveningStartTime} – ${route.eveningEndTime || "—"}`} />
              )}
            </div>

            {/* stops timeline */}
            {route.stops.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wider font-medium mb-2">Stops Timeline</p>
                <div className="space-y-1.5">
                  {route.stops.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                        {i < route.stops.length - 1 && <div className="w-0.5 h-4 bg-white/[0.08]" />}
                      </div>
                      <div className="flex-1 flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2 text-xs">
                        <span className="text-gray-300">{s.stopName || "—"}</span>
                        <span className="text-gray-600 flex items-center gap-1"><Clock size={10} />{s.pickupTime || "—"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   SMALL COMPONENTS
===================================================== */
const STAT_COLORS = {
  indigo: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  sky:    { bg: "bg-sky-500/10",    text: "text-sky-400",    border: "border-sky-500/20"    },
  violet: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  amber:  { bg: "bg-amber-500/10",  text: "text-amber-400",  border: "border-amber-500/20"  },
};
function StatCard({ icon, label, value, color }) {
  const c = STAT_COLORS[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${c.border} ${c.bg} px-4 py-3`}>
      <span className={c.text}>{icon}</span>
      <div>
        <p className="text-[11px] text-gray-600 uppercase tracking-wider font-medium">{label}</p>
        <p className="text-xl font-bold text-white leading-none mt-0.5">{value}</p>
      </div>
    </div>
  );
}

const INFO_COLORS = {
  indigo:  { bg: "bg-indigo-500/10",  text: "text-indigo-400",  border: "border-indigo-500/20"  },
  sky:     { bg: "bg-sky-500/10",     text: "text-sky-400",     border: "border-sky-500/20"     },
  violet:  { bg: "bg-violet-500/10",  text: "text-violet-400",  border: "border-violet-500/20"  },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
};
function InfoCard({ title, icon, color, children }) {
  const c = INFO_COLORS[color] || INFO_COLORS.indigo;
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
      <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3 ${c.text}`}>
        {icon} {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between text-xs gap-2">
      <span className="text-gray-600 flex-shrink-0">{label}</span>
      <span className="text-gray-300 font-medium text-right truncate">{value || "—"}</span>
    </div>
  );
}
function PreviewRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm gap-2">
      <span className="text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-gray-200 font-medium text-right">{value}</span>
    </div>
  );
}
function Field({ label, children }) {
  return <div><label className="block text-xs text-gray-500 mb-1.5 font-medium">{label}</label>{children}</div>;
}
function DI(props) {
  return <input {...props} className="w-full bg-white/[0.05] border border-white/10 text-gray-200 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition" />;
}
function DS({ children, ...props }) {
  return <select {...props} className="w-full bg-white/[0.05] border border-white/10 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500/60 transition">{children}</select>;
}
