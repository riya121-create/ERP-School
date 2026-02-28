import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "../../services/api"

function ClassDetails() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!classId) return

    api
      .get(`/admin/classes/${classId}/students`)
      .then(res => setStudents(res.data))
      .catch(err =>
        console.error(
          "Students API error:",
          err.response?.data || err.message
        )
      )
      .finally(() => setLoading(false))
  }, [classId])

  const activeStudents = students.filter(
    s => s.academicStatus !== "archived" &&
         s.academicStatus !== "expelled" &&
         s.academicStatus !== "transferred"
  )

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Class Students
          </h1>
          <p className="text-gray-500 mt-1">
            Manage students enrolled in this class
          </p>
        </div>

        <button
          onClick={() =>
            navigate(`/admin/classes/${classId}/add-student`)
          }
          className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90"
        >
          + Add Student
        </button>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={students.length} />
        <StatCard label="Active" value={activeStudents.length} />
        <StatCard label="Boys" value={students.filter(s => s.gender === "Male").length} />
        <StatCard label="Girls" value={students.filter(s => s.gender === "Female").length} />
      </div>


      {/* TABLE */}
      {loading ? (
        <Skeleton />
      ) : students.length === 0 ? (
        <EmptyState onAdd={() => navigate(`/admin/classes/${classId}/add-student`)} />
      ) : (
        <div className="bg-white rounded-2xl shadow overflow-x-auto border">
          <table className="w-full">
            <thead className="bg-gray-100 text-sm">
              <tr>
                <th className="p-4 text-left">Roll No</th>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Gender</th>
                <th className="p-4 text-left">Parent</th>
                <th className="p-4 text-left">Phone</th>
                <th className="p-4 text-left">Status</th>
                 
              </tr>
            </thead>


            <tbody>
              {students.map(s => (
                <tr
                  key={s._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-mono">{s.rollNo || "—"}</td>

                  <td className="p-4">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      Admission: {s.admissionNo || "—"}
                    </p>
                  </td>

                  <td className="p-4">{s.gender || "—"}</td>

                  <td className="p-4">{s.parentName || "—"}</td>

                  <td className="p-4 font-mono">{s.parentPhone || "—"}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold
                        ${
                          s.academicStatus === "active"
                            ? "bg-green-100 text-green-700"
                            : s.academicStatus === "archived"
                            ? "bg-yellow-100 text-yellow-700"
                            : s.academicStatus === "expelled"
                            ? "bg-red-100 text-red-700"
                            : s.academicStatus === "transferred"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      `}
                    >
                      {s.academicStatus || "active"}
                    </span>
                  </td>
                

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <div className="bg-white rounded-2xl p-12 text-center shadow border">
      <h2 className="text-xl font-semibold mb-2">
        No students found
      </h2>
      <p className="text-gray-500 mb-6">
        Start by adding students to this class
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-2 bg-black text-white rounded-lg"
      >
        + Add First Student
      </button>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl p-8 shadow border animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

export default ClassDetails
