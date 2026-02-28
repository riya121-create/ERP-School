import { useEffect, useState } from "react";
import api from "../../services/api";

export default function AssignTransportModal({ student, onClose, onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState("");

  const [routeName, setRouteName] = useState("");
  const [stops, setStops] = useState([]);
  const [stopName, setStopName] = useState("");

  const [loadingRoute, setLoadingRoute] = useState(false);

  /* ================= LOAD VEHICLES ================= */

  useEffect(() => {
    api.get("/admin/transport").then(res => {
      setVehicles(res.data || []);
    });
  }, []);

  /* ================= VEHICLE CHANGE ================= */

  const onVehicleChange = async (id) => {
    setVehicleId(id);
    setRouteName("");
    setStops([]);
    setStopName("");

    if (!id) return;

    try {
      setLoadingRoute(true);

      // 🔥 AUTO FETCH ROUTE + STOPS
      const res = await api.get(`/admin/transport/${id}/route`);

      setRouteName(res.data.routeName || "");
      setStops(res.data.stops || []);
    } catch (err) {
      console.error("Route fetch failed", err);
      alert("Route not assigned to this vehicle");
    } finally {
      setLoadingRoute(false);
    }
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!vehicleId || !routeName || !stopName) {
      alert("Please select vehicle and stop");
      return;
    }

    await api.post("/admin/students/transport", {
      studentId: student._id,
      vehicleId,
      routeName,
      stopName
    });

    onSuccess();
    onClose();
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold">
          Assign Transport — {student.name}
        </h2>

        {/* VEHICLE */}
        <select
          className="border p-2 rounded w-full"
          value={vehicleId}
          onChange={e => onVehicleChange(e.target.value)}
        >
          <option value="">Select Vehicle</option>
          {vehicles.map(v => (
            <option key={v._id} value={v._id}>
              {v.vehicleNo}
            </option>
          ))}
        </select>

        {/* ROUTE (AUTO) */}
        <input
          className="border p-2 rounded w-full bg-gray-100"
          value={loadingRoute ? "Loading route..." : routeName}
          readOnly
        />

        {/* STOPS */}
        <select
          className="border p-2 rounded w-full"
          value={stopName}
          onChange={e => setStopName(e.target.value)}
          disabled={!stops.length}
        >
          <option value="">
            {stops.length ? "Select Stop" : "No stops available"}
          </option>
          {stops.map(s => (
            <option key={s.order} value={s.stopName}>
              {s.stopName}
            </option>
          ))}
        </select>

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 pt-3">
          <button onClick={onClose} className="px-4 py-2">
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 bg-black text-white rounded"
            disabled={!vehicleId || !stopName}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
