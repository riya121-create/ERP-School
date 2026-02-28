import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AddParent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    password: "parent123",
    confirmPassword: "parent123",
    isActive: true
  });

  const change = e =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateStep1 = () => {
    if (!formData.name || !formData.phone) {
      alert("Name and phone are required");
      return false;
    }
    if (formData.phone.length < 10) {
      alert("Please enter a valid phone number");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email) {
      alert("Email is required");
      return false;
    }
    if (!formData.email.includes("@")) {
      alert("Please enter a valid email");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/admin/parents", formData);
      alert("Parent created successfully!");
      navigate("/admin/parents");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating parent");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter parent's full name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Enter 10-digit phone number"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                rows={3}
                placeholder="Enter home address"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={change}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="parent@example.com"
                required
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Login Credentials</h3>
              <div className="text-sm text-blue-600">
                <p><strong>Default Password:</strong> parent123</p>
                <p>Parent can change this after first login</p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="font-medium mb-4">Parent Details:</h3>
              <div className="space-y-2">
                <div><strong>Name:</strong> {formData.name}</div>
                <div><strong>Phone:</strong> {formData.phone}</div>
                <div><strong>Email:</strong> {formData.email}</div>
                <div><strong>Address:</strong> {formData.address || "Not provided"}</div>
                <div><strong>Status:</strong> {formData.isActive ? "Active" : "Inactive"}</div>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">Important Notes:</h3>
              <ul className="text-sm text-yellow-600 list-disc list-inside">
                <li>Parent will be linked to students via phone number</li>
                <li>Default password is "parent123"</li>
                <li>Parent will need to change password on first login</li>
                <li>Make sure phone number matches student's parentPhone field</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Add Parent</h1>
          <p className="text-gray-500 mt-1">Create a new parent account</p>
        </div>
        <button
          onClick={() => navigate("/admin/parents")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">1</div>
            <span className="ml-2">Basic Info</span>
          </div>
          <div className={`flex items-center ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">2</div>
            <span className="ml-2">Contact</span>
          </div>
          <div className={`flex items-center ${step >= 3 ? "text-blue-600" : "text-gray-400"}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">3</div>
            <span className="ml-2">Review</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow p-8">
        {renderStep()}

        {/* ACTIONS */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90"
            >
              Next
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Parent"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AddParent;
