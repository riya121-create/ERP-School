import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";

/*
====================================================
TRANSPORT MANAGER – ULTRA FAANG / ERP GRADE (FINAL)
====================================================
*/

export default function TransportManager() {
  const [tab, setTab] = useState("vehicles");

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          Transport Management
        </h1>
        <p className="text-gray-500 mt-1">
          Vehicles • Routes • Stops • Scheduling
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-8 border-b">
        <Tab label="Vehicles" active={tab === "vehicles"} onClick={() => setTab("vehicles")} />
        <Tab label="Assignments" active={tab === "assignments"} onClick={() => setTab("assignments")} />
      </div>

      {tab === "vehicles" && <VehicleSection />}
      {tab === "assignments" && <AssignmentSection />}
    </div>
  );
}

/* =================================================
   VEHICLES – ADD + ADMIN VIEW
================================================= */
function VehicleSection() {
  const [vehicles, setVehicles] = useState([]);
  const [openId, setOpenId] = useState(null);

  const [form, setForm] = useState({
    vehicleNo: "",
    vehicleType: "Bus",
    capacity: "",
    driverName: "",
    driverPhone: "",
  });

  useEffect(() => {
    api.get("/admin/transport").then(res => setVehicles(res.data));
  }, []);

  const stats = useMemo(() => {
    return {
      total: vehicles.length,
      bus: vehicles.filter(v => v.vehicleType === "Bus").length,
      van: vehicles.filter(v => v.vehicleType === "Van").length,
      auto: vehicles.filter(v => v.vehicleType === "Auto").length,
    };
  }, [vehicles]);

  const addVehicle = async () => {
    if (!form.vehicleNo || !form.capacity) {
      alert("Vehicle No & Capacity required");
      return;
    }

    const res = await api.post("/admin/transport", {
      vehicleNo: form.vehicleNo,
      vehicleType: form.vehicleType,
      capacity: Number(form.capacity),
      driver: {
        name: form.driverName,
        phone: form.driverPhone,
      },
    });

    setVehicles([res.data, ...vehicles]);
    setForm({
      vehicleNo: "",
      vehicleType: "Bus",
      capacity: "",
      driverName: "",
      driverPhone: "",
    });
  };

  return (
    <div className="space-y-10">

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Transport" value={stats.total} />
        <StatCard title="Buses" value={stats.bus} />
        <StatCard title="Vans" value={stats.van} />
        <StatCard title="Autos" value={stats.auto} />
      </div>

      {/* ADD VEHICLE */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Add Transport</h2>

        <div className="grid md:grid-cols-6 gap-4">
          <input className="input" placeholder="Vehicle No"
            value={form.vehicleNo}
            onChange={e => setForm({ ...form, vehicleNo: e.target.value })} />

          <select className="input"
            value={form.vehicleType}
            onChange={e => setForm({ ...form, vehicleType: e.target.value })}>
            <option>Bus</option>
            <option>Van</option>
            <option>Auto</option>
          </select>

          <input className="input" type="number" placeholder="Capacity"
            value={form.capacity}
            onChange={e => setForm({ ...form, capacity: e.target.value })} />

          <input className="input" placeholder="Driver Name"
            value={form.driverName}
            onChange={e => setForm({ ...form, driverName: e.target.value })} />

          <input className="input" placeholder="Driver Phone"
            value={form.driverPhone}
            onChange={e => setForm({ ...form, driverPhone: e.target.value })} />

          <button onClick={addVehicle} className="btn-primary">
            Add
          </button>
        </div>
      </div>

      {/* VEHICLE DETAILS */}
      <div className="space-y-6">
        {vehicles.map(v => (
          <div key={v._id} className="bg-white rounded-2xl border shadow-sm">
            <div
              className="flex justify-between items-center p-6 cursor-pointer hover:bg-gray-50"
              onClick={() => setOpenId(openId === v._id ? null : v._id)}
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {v.vehicleType} • {v.vehicleNo}
                </h3>
                <p className="text-sm text-gray-500">
                  Capacity {v.capacity}
                </p>
              </div>
              <span className="text-gray-400">
                {openId === v._id ? "▲" : "▼"}
              </span>
            </div>

            {openId === v._id && (
              <div className="border-t p-6 grid md:grid-cols-4 gap-6 text-sm">
                <DetailCard title="Vehicle">
                  <Info label="Number" value={v.vehicleNo} />
                  <Info label="Type" value={v.vehicleType} />
                  <Info label="Capacity" value={v.capacity} />
                </DetailCard>

                <DetailCard title="Driver">
                  <Info label="Name" value={v.driver?.name || "—"} />
                  <Info label="Phone" value={v.driver?.phone || "—"} />
                </DetailCard>

                <DetailCard title="Route">
                  {v.route ? (
                    <>
                      <Info label="Route" value={v.route.routeName} />
                      <Info label="From" value={v.route.startLocation} />
                      <Info label="To" value={v.route.endLocation} />
                     

<Info
  label="Morning"
  value={`${v.route.morningStartTime} – ${v.route.morningEndTime}`}
/>

<Info
  label="Evening"
  value={`${v.route.eveningStartTime || "—"} – ${v.route.eveningEndTime || "—"}`}
/>

                    </>
                  ) : (
                    <p className="text-gray-400">Not assigned</p>
                  )}
                </DetailCard>

                <DetailCard title="Stops">
                  {v.route?.stops?.length ? (
                    <ol className="space-y-2">
                      {v.route.stops
                        .sort((a, b) => a.order - b.order)
                        .map(s => (
                          <li key={s.order}
                            className="flex justify-between bg-gray-100 rounded-lg px-3 py-2">
                            <span>#{s.order} {s.stopName}</span>
                            <span className="text-gray-500">{s.pickupTime}</span>
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p className="text-gray-400">No stops</p>
                  )}
                </DetailCard>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =================================================
   ASSIGNMENTS – ULTRA UX (FORM + LIVE VIEW)
================================================= */
function AssignmentSection() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("");
const [route, setRoute] = useState({
  routeName: "",
  startLocation: "",
  endLocation: "",
  morningStartTime: "",
  morningEndTime: "",
  eveningStartTime: "",
  eveningEndTime: "",
  distanceKm: "",
  stops: [],
});

  useEffect(() => {
    api.get("/admin/transport").then(res => setVehicles(res.data));
  }, []);

  const vehicle = vehicles.find(v => v._id === selectedVehicle);

  const addStop = () => {
    setRoute({
      ...route,
      stops: [...route.stops, { stopName: "", pickupTime: "", order: route.stops.length + 1 }],
    });
  };

  const assignRoute = async () => {
   if (
  !selectedVehicle ||
  !route.routeName ||
  !route.startLocation ||
  !route.endLocation ||
  !route.morningStartTime ||
  !route.morningEndTime
) {
  alert("Please fill all required route fields");
  return;
}

    await api.put(`/admin/transport/${selectedVehicle}/route`, route);
    alert("Route + Stops assigned ✅");
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">

      {/* FORM */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">Assign Route & Stops</h2>

        <select className="input" onChange={e => setSelectedVehicle(e.target.value)}>
          <option value="">Select Transport</option>
          {vehicles.map(v => (
            <option key={v._id} value={v._id}>
              {v.vehicleType} • {v.vehicleNo}
            </option>
          ))}
        </select>

        <input className="input" placeholder="Route Name"
          onChange={e => setRoute({ ...route, routeName: e.target.value })} />




<input
  className="input"
  placeholder="From (Start Location)"
  onChange={e => setRoute({ ...route, startLocation: e.target.value })}
/>

<input
  className="input"
  placeholder="To (End Location)"
  onChange={e => setRoute({ ...route, endLocation: e.target.value })}
/>




     <input className="input" placeholder="Morning Start Time"
  onChange={e =>
    setRoute({ ...route, morningStartTime: e.target.value })
  }
/>

<input className="input" placeholder="Morning End Time"
  onChange={e =>
    setRoute({ ...route, morningEndTime: e.target.value })
  }
/>

<div className="grid grid-cols-2 gap-4">
  <input
    className="input"
    placeholder="Evening Start Time"
    onChange={e =>
      setRoute({ ...route, eveningStartTime: e.target.value })
    }
  />
  <input
    className="input"
    placeholder="Evening End Time"
    onChange={e =>
      setRoute({ ...route, eveningEndTime: e.target.value })
    }
  />
</div>


        <div>
          <h3 className="font-medium mb-2">Stops</h3>
          {route.stops.map((s, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input className="input" placeholder="Stop Name"
                onChange={e => {
                  const stops = [...route.stops];
                  stops[i].stopName = e.target.value;
                  setRoute({ ...route, stops });
                }} />
              <input className="input" placeholder="Pickup Time"
                onChange={e => {
                  const stops = [...route.stops];
                  stops[i].pickupTime = e.target.value;
                  setRoute({ ...route, stops });
                }} />
              <span className="text-xs text-gray-500 self-center">#{s.order}</span>
            </div>
          ))}
          <button onClick={addStop} className="btn-secondary mt-2">
            + Add Stop
          </button>
        </div>

        <button onClick={assignRoute} className="btn-primary w-full">
          Assign Route
        </button>
      </div>

      {/* VIEW DETAILS – ULTRA UX */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <h3 className="font-semibold mb-3">Live Preview</h3>

          {vehicle ? (
            <div className="space-y-2 text-sm">
              <Info label="Vehicle" value={`${vehicle.vehicleType} • ${vehicle.vehicleNo}`} />
              <Info label="Route" value={route.routeName || "—"} />
              <Info label="From → To" value={`${route.startLocation || "—"} → ${route.endLocation || "—"}`} />
              <Info
  label="Morning"
  value={`${route.morningStartTime || "—"} – ${route.morningEndTime || "—"}`}
/>

<Info
  label="Evening"
  value={`${route.eveningStartTime || "—"} – ${route.eveningEndTime || "—"}`}
/>


              <div className="mt-3">
                <p className="font-medium mb-1">Stops Timeline</p>
                {route.stops.length ? (
                  <ol className="space-y-2">
                    {route.stops.map(s => (
                      <li key={s.order}
                        className="flex justify-between bg-gray-100 rounded-lg px-3 py-2">
                        <span>#{s.order} {s.stopName || "—"}</span>
                        <span className="text-gray-500">{s.pickupTime || "—"}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-gray-400">No stops added</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Select a transport to preview details</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =================================================
   UI HELPERS
================================================= */
function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function DetailCard({ title, children }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="font-semibold mb-3 text-gray-700">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Tab({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`pb-3 text-sm font-medium transition
        ${active
          ? "border-b-2 border-blue-600 text-blue-600"
          : "text-gray-500 hover:text-gray-700"}`}
    >
      {label}
    </button>
  );
}
