import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import api from "../../services/api"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function TeacherClasses() {
  const navigate = useNavigate()
  const [classes, setClasses] = useState([])
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    api.get("/teacher/classes").then(res => setClasses(res.data))
  }, [])

  const filtered = classes.filter(c =>
    filter === "ALL" ? true : c.role === filter
  )

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-10 py-10">
      {/* HEADER */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mb-10"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          My Classes
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          All assigned & teaching classes
        </p>
      </motion.div>

      {/* FILTER */}
      <div className="flex gap-3 mb-8">
        {["ALL", "CLASS_TEACHER", "SUBJECT_TEACHER"].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`
              px-4 py-2 rounded-xl text-sm
              ${
                filter === type
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }
            `}
          >
            {type === "ALL"
              ? "All"
              : type === "CLASS_TEACHER"
              ? "Class Teacher"
              : "Subject Teacher"}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-gray-400">
            <tr>
              <th className="text-left px-6 py-4">Class</th>
              <th className="text-left px-6 py-4">Section</th>
              <th className="text-left px-6 py-4">Role</th>
              <th className="text-left px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map(cls => (
              <motion.tr
                key={cls._id}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="border-t border-white/10 hover:bg-white/5"
              >
                <td className="px-6 py-4 font-medium">
                  {cls.name}
                </td>

                <td className="px-6 py-4 text-gray-300">
                  {cls.section}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium
                      ${
                        cls.role === "CLASS_TEACHER"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }
                    `}
                  >
                    {cls.role === "CLASS_TEACHER"
                      ? "Class Teacher"
                      : `Subject Teacher (${cls.subject})`}
                  </span>
                </td>

                <td className="px-6 py-4">
                  {cls.role === "CLASS_TEACHER" ? (
                    <button
                      onClick={() =>
                        navigate(`/teacher/class/${cls.classId}`)
                      }
                      className="text-blue-400 hover:underline"
                    >
                      Open →
                    </button>
                  ) : (
                    <span className="text-gray-500 text-xs">
                      View only
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  No classes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
