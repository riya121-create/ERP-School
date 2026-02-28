import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddTeacher() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    employeeId: "",
    department: "",
    qualification: "",
    experience: "",
    gender: "",
    joiningDate: "",
    status: "active",
    address: ""
  });

  const change = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    try {
      await api.post("/admin/teachers", form);
      alert("Teacher added successfully");
      navigate("/admin/teachers");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-2">
        Add New Teacher
      </h1>
      <p className="text-gray-500 mb-8">
        Complete teacher onboarding in 3 simple steps
      </p>

      {/* STEPS */}
      <StepIndicator step={step} />

      <div className="bg-white rounded-2xl shadow p-8 mt-6">

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <SectionTitle title="Basic Information" />
            <div className="grid md:grid-cols-2 gap-4">
              <Input name="name" label="Full Name" onChange={change} />
              <Input name="email" label="Email" onChange={change} />
              <Input name="mobile" label="Mobile Number" onChange={change} />
              <Input name="employeeId" label="Employee ID" onChange={change} />
            </div>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <SectionTitle title="Professional Details" />
            <div className="grid md:grid-cols-3 gap-4">
              <Input name="department" label="Department" onChange={change} />
              <Input name="qualification" label="Qualification" onChange={change} />
              <Input name="experience" label="Experience (Years)" onChange={change} />
              <Select name="gender" label="Gender" onChange={change} />
              <Input type="date" name="joiningDate" label="Joining Date" onChange={change} />
              <Select
                name="status"
                label="Status"
                options={["active", "inactive"]}
                onChange={change}
              />
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <SectionTitle title="Review & Confirm" />

            <div className="mb-4">
              <label className="block text-sm mb-1">Address</label>
              <textarea
                name="address"
                className="w-full border rounded-lg p-3"
                rows={3}
                onChange={change}
              />
            </div>

            <ReviewCard form={form} />
          </>
        )}

        {/* FOOTER */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 rounded-lg border"
            >
              ← Back
            </button>
          ) : <div />}

          {step < 3 ? (
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
              ✓ Create Teacher
            </button>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4">
          Default password will be auto-generated and shared securely.
        </p>
      </div>
    </div>
  );
}

/* ===== COMPONENTS ===== */

function StepIndicator({ step }) {
  return (
    <div className="flex gap-4">
      {["Basic Info", "Professional", "Review"].map((label, i) => (
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

function Select({ label, options = ["Male", "Female", "Other"], ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <select {...props} className="w-full border rounded-lg p-3">
        <option value="">Select</option>
        {options.map(o => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default AddTeacher;
