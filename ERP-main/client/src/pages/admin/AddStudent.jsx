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
  const change = e => {
    const { name, value } = e.target;
    
    // Mobile number validation for parentPhone
    if (name === "parentPhone") {
      // Only allow numbers and limit to 10 digits
      const phoneValue = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, [name]: phoneValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

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
    // Validate mobile number (must be exactly 10 digits)
    if (form.parentPhone && form.parentPhone.length !== 10) {
      alert("Parent phone number must be exactly 10 digits");
      return;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 max-w-4xl mx-auto">

      {/* ===== HEADER ===== */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100 mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Add New Student
        </h1>
        <p className="text-gray-600 text-lg">
          Complete student onboarding in 4 simple steps
        </p>
      </div>

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
              <div>
                <label className="block text-sm mb-1">Parent Phone</label>
                <input
                  name="parentPhone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={form.parentPhone}
                  onChange={change}
                  className={`w-full border rounded-lg p-3 ${
                    form.parentPhone && form.parentPhone.length !== 10
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  maxLength={10}
                />
                {form.parentPhone && form.parentPhone.length > 0 && (
                  <p className={`text-xs mt-1 ${
                    form.parentPhone.length === 10
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {form.parentPhone.length === 10
                      ? "✓ Valid phone number"
                      : `⚠ ${10 - form.parentPhone.length} more digit${10 - form.parentPhone.length > 1 ? 's' : ''} needed`}
                  </p>
                )}
              </div>
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
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              ← Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={submit}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
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
    <div className="flex gap-3">
      {["Student Info", "Parent Info", "Transport", "Review"].map((label, i) => (
        <div
          key={label}
          className={`flex-1 text-center py-3 rounded-full text-sm font-medium transition-all duration-200 ${
            step === i + 1
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
              : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600"
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step === i + 1
                ? "bg-white text-blue-600"
                : "bg-gray-300 text-gray-600"
            }`}>
              {i + 1}
            </span>
            <span>{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
      {title}
    </h2>
  );
}

function ReviewCard({ form }) {
  return (
    <div className="grid md:grid-cols-2 gap-4 text-sm">
      {Object.entries(form).map(([k, v]) => (
        <div key={k} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <p className="text-blue-600 font-medium capitalize mb-1">
            {k.replace(/([A-Z])/g, " $1").trim()}
          </p>
          <p className="font-semibold text-gray-800">
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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <input {...props} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200" />
    </div>
  );
}

function Select({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select {...props} className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
        <option value="">Select</option>
        <option>Male</option>
        <option>Female</option>
        <option>Other</option>
      </select>
    </div>
  );
}

export default AddStudent;
