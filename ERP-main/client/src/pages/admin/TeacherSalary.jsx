import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function TeacherSalary() {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    basicSalary: "",
    allowances: [],
    deductions: [],
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get teacher info
        const teacherRes = await api.get(`/admin/teachers/${teacherId}`);
        setTeacher(teacherRes.data.teacher);

        // Get current salary
        const salaryRes = await api.get(`/admin/teachers/${teacherId}/salary`);
        if (salaryRes.data.salary) {
          setSalary(salaryRes.data.salary);
          setFormData({
            basicSalary: salaryRes.data.salary.basicSalary || "",
            allowances: salaryRes.data.salary.allowances || [],
            deductions: salaryRes.data.salary.deductions || [],
            effectiveDate: salaryRes.data.salary.effectiveDate?.split('T')[0] || new Date().toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        alert(`Failed to load data: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchData();
  }, [teacherId]);

  const addAllowance = () => {
    setFormData(prev => ({
      ...prev,
      allowances: [...prev.allowances, { name: "", amount: "", type: "fixed" }]
    }));
  };

  const removeAllowance = (index) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.filter((_, i) => i !== index)
    }));
  };

  const updateAllowance = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      allowances: prev.allowances.map((allowance, i) => 
        i === index ? { ...allowance, [field]: value } : allowance
      )
    }));
  };

  const addDeduction = () => {
    setFormData(prev => ({
      ...prev,
      deductions: [...prev.deductions, { name: "", amount: "", type: "fixed" }]
    }));
  };

  const removeDeduction = (index) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.filter((_, i) => i !== index)
    }));
  };

  const updateDeduction = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      deductions: prev.deductions.map((deduction, i) => 
        i === index ? { ...deduction, [field]: value } : deduction
      )
    }));
  };

  const calculateTotal = () => {
    const basic = parseFloat(formData.basicSalary) || 0;
    const allowancesTotal = formData.allowances.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
    const deductionsTotal = formData.deductions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    return basic + allowancesTotal - deductionsTotal;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/admin/teachers/${teacherId}/salary`, {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary)
      });
      alert("Salary structure saved successfully!");
      navigate("/admin/teachers");
    } catch (error) {
      console.error("Failed to save salary:", error);
      alert(error.response?.data?.message || "Failed to save salary");
    } finally {
      setLoading(false);
    }
  };

  if (!teacher) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-gray-500 mt-1">
            Manage salary for: <span className="font-semibold">{teacher.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Teachers
        </button>
      </div>

      {/* CURRENT SALARY */}
      {salary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">Current Salary Structure</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Basic:</span>
              <span className="font-medium ml-2">₹{salary.basicSalary}</span>
            </div>
            <div>
              <span className="text-gray-600">Allowances:</span>
              <span className="font-medium ml-2">₹{salary.allowances?.reduce((sum, a) => sum + a.amount, 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Deductions:</span>
              <span className="font-medium ml-2">₹{salary.deductions?.reduce((sum, d) => sum + d.amount, 0)}</span>
            </div>
            <div>
              <span className="text-gray-600">Total:</span>
              <span className="font-bold ml-2">₹{salary.totalSalary}</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-8">
        <form onSubmit={handleSubmit}>
          {/* BASIC SALARY */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Basic Salary</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Basic Salary *</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData(prev => ({ ...prev, basicSalary: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="Enter basic salary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Effective Date *</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, effectiveDate: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          {/* ALLOWANCES */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Allowances</h2>
              <button
                type="button"
                onClick={addAllowance}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
              >
                + Add Allowance
              </button>
            </div>
            <div className="space-y-3">
              {formData.allowances.map((allowance, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={allowance.name}
                    onChange={(e) => updateAllowance(index, 'name', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Allowance name"
                  />
                  <input
                    type="number"
                    value={allowance.amount}
                    onChange={(e) => updateAllowance(index, 'amount', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Amount"
                  />
                  <select
                    value={allowance.type}
                    onChange={(e) => updateAllowance(index, 'type', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeAllowance(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* DEDUCTIONS */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Deductions</h2>
              <button
                type="button"
                onClick={addDeduction}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                + Add Deduction
              </button>
            </div>
            <div className="space-y-3">
              {formData.deductions.map((deduction, index) => (
                <div key={index} className="grid md:grid-cols-4 gap-4">
                  <input
                    type="text"
                    value={deduction.name}
                    onChange={(e) => updateDeduction(index, 'name', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Deduction name"
                  />
                  <input
                    type="number"
                    value={deduction.amount}
                    onChange={(e) => updateDeduction(index, 'amount', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                    placeholder="Amount"
                  />
                  <select
                    value={deduction.type}
                    onChange={(e) => updateDeduction(index, 'type', e.target.value)}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">Percentage</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeDeduction(index)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Monthly Salary:</span>
              <span className="text-2xl font-bold text-green-600">₹{calculateTotal()}</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/admin/teachers")}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Salary Structure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherSalary;
