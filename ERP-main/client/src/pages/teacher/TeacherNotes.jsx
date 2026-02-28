import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import api from "../../services/api"

export default function TeacherNotes() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedNote, setSelectedNote] = useState(null)
  const [stats, setStats] = useState({ totalNotes: 0, totalDownloads: 0, categories: {} })
  const [filters, setFilters] = useState({ classId: "", subject: "", category: "" })

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    classId: "",
    category: "notes",
    tags: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [notesRes, classesRes, statsRes] = await Promise.all([
        api.get("/notes", { params: filters }),
        api.get("/teacher/classes"),
        api.get("/notes/stats")
      ])
      
      setNotes(notesRes.data)
      setClasses(classesRes.data)
      setStats(statsRes.data)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("/notes", formData)
      setShowUploadForm(false)
      setFormData({ title: "", description: "", subject: "", classId: "", category: "notes", tags: "" })
      fetchData()
    } catch (error) {
      console.error("Failed to upload note:", error)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this note?")) {
      try {
        await api.delete(`/notes/${id}`)
        fetchData()
      } catch (error) {
        console.error("Failed to delete note:", error)
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    })
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return '📄'
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝'
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📊'
    if (fileType?.includes('image')) return '🖼️'
    return '📎'
  }

  const getCategoryColor = (category) => {
    const colors = {
      notes: "bg-blue-500/20 text-blue-400",
      slides: "bg-green-500/20 text-green-400",
      assignment: "bg-purple-500/20 text-purple-400",
      reference: "bg-yellow-500/20 text-yellow-400",
      other: "bg-gray-500/20 text-gray-400"
    }
    return colors[category] || colors.other
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold">Notes & Resources</h1>
            <p className="text-gray-400 mt-2">Upload and manage study materials</p>
          </div>
          <button
            onClick={() => setShowUploadForm(true)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition"
          >
            + Upload Note
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-gray-400 text-sm">Total Notes</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalNotes}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-gray-400 text-sm">Total Downloads</h3>
            <p className="text-3xl font-bold mt-2 text-green-400">{stats.totalDownloads}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
            <h3 className="text-gray-400 text-sm">Categories</h3>
            <div className="mt-2 space-y-1">
              {Object.entries(stats.categories).map(([cat, count]) => (
                <div key={cat} className="flex justify-between text-sm">
                  <span className="capitalize">{cat}</span>
                  <span className="text-blue-400">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 mb-8"
        >
          <h3 className="text-lg font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-4 gap-4">
            <select
              value={filters.classId}
              onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.section}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Search by subject..."
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              <option value="notes">Notes</option>
              <option value="slides">Slides</option>
              <option value="assignment">Assignments</option>
              <option value="reference">Reference</option>
            </select>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>

        {/* Notes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {notes.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
              <p className="text-gray-400">No notes uploaded yet</p>
              <button
                onClick={() => setShowUploadForm(true)}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Upload First Note
              </button>
            </div>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getFileIcon(note.fileType)}</span>
                      <h3 className="text-xl font-semibold">{note.title}</h3>
                      <span className={`px-2 py-1 rounded-lg text-sm ${getCategoryColor(note.category)}`}>
                        {note.category}
                      </span>
                    </div>
                    <p className="text-gray-400 mb-3">{note.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📚 {note.classId?.name} - {note.classId?.section}</span>
                      <span>📖 {note.subject}</span>
                      <span>📅 {formatDate(note.createdAt)}</span>
                      <span>💾 {formatFileSize(note.fileSize)}</span>
                      <span>⬇️ {note.downloadCount} downloads</span>
                    </div>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex items-center gap-2 mt-2">
                        {note.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.open(note.fileUrl, '_blank')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Upload Note Modal */}
        {showUploadForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowUploadForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1f2e] rounded-2xl p-8 max-w-2xl w-full border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-6">Upload Note</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Class</label>
                    <select
                      required
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select Class</option>
                      {classes.map((cls) => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name} - {cls.section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                    >
                      <option value="notes">Notes</option>
                      <option value="slides">Slides</option>
                      <option value="assignment">Assignment</option>
                      <option value="reference">Reference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="math, chapter1, important"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">File</label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png"
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:border-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold"
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadForm(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                  >
                    Upload Note
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
