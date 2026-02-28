import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../services/api";

function AddStudent() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  /* =====================
     FORM STATE
  ====================== */
  const [form, setForm] = useState({
    name: "",
    admissionNo: "",
    rollNo: "",
    gender: "",
    dob: "",
    parentName: "",
    parentPhone: "",
    address: "",
    transportVehicle: "",
    routeName: "",
    stopName: ""
  });

  /* =====================
     TRANSPORT STATE
  ====================== */
  const [vehicles, setVehicles] = useState([]);
  const [route, setRoute] = useState(null);

  /* =====================
     LOAD VEHICLES
  ====================== */
  useEffect(() => {
    api.get("/admin/transport").then(res => {
      setVehicles(res.data.filter(v => v.status === "active"));
    });
  }, []);

  /* =====================
     HANDLERS
  ====================== */
  const change = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleVehicleChange = async e => {
    const vehicleId = e.target.value;

    setForm(f => ({
      ...f,
      transportVehicle: vehicleId,
      routeName: "",
      stopName: ""
    }));

    if (!vehicleId) {
      setRoute(null);
      return;
    }

    try {
      const res = await api.get(
        `/admin/transport/${vehicleId}/route`
      );

      setRoute(res.data);
      setForm(f => ({
        ...f,
        routeName: res.data.routeName
      }));
    } catch (err) {
      console.error("Route fetch failed", err);
      alert("No route assigned to this vehicle");
      setRoute(null);
    }
  };

  const submit = async () => {
    try {
      await api.post("/admin/students", {
        ...form,
        classId
      });
      alert("Student added successfully");
      navigate(`/admin/classes/${classId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* ===== HEADER ===== */}
      <h1 className="text-3xl font-bold mb-2">
        Add New Student
      </h1>
      <p className="text-gray-500 mb-8">
        Complete student onboarding in 4 simple steps
      </p>

      {/* ===== STEPS ===== */}
      <StepIndicator step={step} />

      {/* ===== CONTENT ===== */}
      <div className="bg-white rounded-2xl shadow p-8 mt-6">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <SectionTitle title="Student Information" />
            <div className="grid md:grid-cols-3 gap-4">
              <Input name="name" label="Student Name" onChange={change} />
              <Input name="admissionNo" label="Admission No" onChange={change} />
              <Input name="rollNo" label="Roll No" onChange={change} />
              <Select name="gender" label="Gender" onChange={change} />
              <Input type="date" name="dob" label="Date of Birth" onChange={change} />
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <SectionTitle title="Parent / Guardian Details" />
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="parentName" label="Parent Name" onChange={change} />
              <Input name="parentPhone" label="Parent Phone" onChange={change} />
            </div>

            <div className="mt-4">
              <label className="block text-sm mb-1">Address</label>
              <textarea
                name="address"
                className="w-full border rounded-lg p-3"
                rows={3}
                onChange={change}
              />
            </div>
          </>
        )}

        {/* STEP 3 – TRANSPORT */}
        {step === 3 && (
          <>
            <SectionTitle title="Transport Details" />

            <div className="grid md:grid-cols-2 gap-4">
              {/* VEHICLE */}
              <div>
                <label className="block text-sm mb-1">Vehicle</label>
                <select
                  value={form.transportVehicle}
                  onChange={handleVehicleChange}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">No Transport</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.vehicleNo} ({v.vehicleType})
                    </option>
                  ))}
                </select>
              </div>

              {/* ROUTE */}
              <div>
                <label className="block text-sm mb-1">Route</label>
                <input
                  value={route?.routeName || ""}
                  disabled
                  className="w-full border rounded-lg p-3 bg-gray-100"
                />
              </div>

              {/* STOP SELECT */}
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Pickup Stop</label>
                <select
                  name="stopName"
                  value={form.stopName}
                  onChange={change}
                  disabled={!route?.stops?.length}
                  className="w-full border rounded-lg p-3"
                >
                  <option value="">
                    {route?.stops?.length
                      ? "Select Pickup Stop"
                      : "Select vehicle first"}
                  </option>

                  {route?.stops?.map(stop => (
                    <option key={stop.order} value={stop.stopName}>
                      #{stop.order} {stop.stopName} ({stop.pickupTime})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <>
            <SectionTitle title="Review & Confirm" />
            <ReviewCard form={form} />
          </>
        )}

        {/* ===== FOOTER ACTIONS ===== */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 rounded-lg border"
            >
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-2 bg-black text-white rounded-lg"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              className="px-8 py-2 bg-green-600 text-white rounded-lg"
            >
              ✓ Save Student
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

/* =========================
   COMPONENTS
========================= */

function StepIndicator({ step }) {
  return (
    <div className="flex gap-4">
      {["Student Info", "Parent Info", "Transport", "Review"].map((label, i) => (
        <div
          key={label}
          className={`flex-1 text-center py-2 rounded-full text-sm font-medium ${
            step === i + 1
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {i + 1}. {label}
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="text-xl font-semibold mb-6">
      {title}
    </h2>
  );
}

function ReviewCard({ form }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      {Object.entries(form).map(([k, v]) => (
        <div key={k} className="bg-gray-50 rounded-lg p-3">
          <p className="text-gray-500 capitalize">
            {k.replace(/([A-Z])/g, " $1")}
          </p>
          <p className="font-medium">
            {v || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input {...props} className="w-full border rounded-lg p-3" />
    </div>
  );
}

function Select({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select {...props} className="w-full border rounded-lg p-3">
        <option value="">Select</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
    </div>
  );
}

export default AddStudent;
