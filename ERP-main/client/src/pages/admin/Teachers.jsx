import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/admin/teachers")
      .then(res => setTeachers(res.data))
      .catch(() => {});
  }, []);

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = teachers.filter(t => t.isActive).length;

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage faculty & assignments
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/teachers/add")}
          className="px-5 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          + Add Teacher
        </button>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Stat label="Total Teachers" value={teachers.length} />
        <Stat label="Active" value={activeCount} />
        <Stat label="Inactive" value={teachers.length - activeCount} />
      </div>

      {/* ===== SEARCH ===== */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full md:w-96 border rounded-lg px-4 py-2 focus:outline-none focus:ring"
        />
      </div>

      {/* ===== TABLE ===== */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0">
            <tr>
              <Th>Teacher</Th>
              <Th>Department</Th>
              <Th>Contact</Th>
              <Th>Status</Th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">
                  No teachers found
                </td>
              </tr>
            ) : (
              filtered.map(t => (
                <tr
                  key={t._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 flex items-center gap-3">
                    <Avatar name={t.name} />
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.email}</p>
                    </div>
                  </td>

                  <td className="p-4 text-sm">
                    {t.department || "—"}
                  </td>

                  <td className="p-4 text-sm">
                    {t.phone || "—"}
                  </td>

                  <td className="p-4">
                    <StatusBadge active={t.isActive} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="p-4 text-left text-sm font-semibold">
      {children}
    </th>
  );
}

function Avatar({ name }) {
  return (
    <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-sm font-semibold">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        active
          ? "bg-green-100 text-green-700"
          : "bg-red-100 text-red-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default Teachers;
