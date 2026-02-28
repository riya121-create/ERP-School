import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../services/api";

/* ================= ANIMATIONS ================= */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function TeacherPublishResults() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [examClasses, setExamClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [exam, setExam] = useState(null);
  const [stats, setStats] = useState({ 
    totalStudents: 0, 
    passedStudents: 0, 
    failedStudents: 0, 
    averageMarks: 0,
    highestMarks: 0,
    lowestMarks: 0,
    passRate: "0%"
  });

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    let alive = true;
    setLoading(true);

    api
      .get(`/teacher/view/${examId}`)
      .then(res => {
        if (!alive) return;

        const examData = res.data.exam;
        const classes = examData?.classes || [];
        
        setExam(examData);
        setExamClasses(classes);

        // auto select if single class
        if (
          classes.length === 1 &&
          classes[0].classId?._id &&
          classes[0].section
        ) {
          const c = classes[0];
          setSelectedClass(`${c.classId._id}_${c.section}`);
          loadResultsForClass(`${c.classId._id}_${c.section}`);
        }
      })
      .catch(err => {
        console.error("EXAM LOAD ERROR:", err);
        alert("Failed to load exam");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => { alive = false };
  }, [examId]);

  /* ================= LOAD RESULTS ================= */
  const loadResultsForClass = async (classKey) => {
    try {
      const res = await api.get(`/publish-results/published/${examId}?classKey=${classKey}`);
      setResults(res.data.results || []);
      setStats(res.data.stats || {
        totalStudents: 0, 
        passedStudents: 0, 
        failedStudents: 0, 
        averageMarks: 0,
        highestMarks: 0,
        lowestMarks: 0,
        passRate: "0%"
      });
    } catch (error) {
      console.error("Failed to load results:", error);
    }
  };

  /* ================= PUBLISH RESULTS ================= */
  const publishResults = async () => {
    if (!confirm("Are you sure you want to publish these results? This action cannot be undone.")) {
      return;
    }

    setPublishing(true);
    
    try {
      const marksData = results.map(result => ({
        studentId: result.studentId._id,
        marks: result.marks,
        grade: result.grade,
        remarks: result.remarks
      }));

      await api.post("/publish-results/publish", {
        examId,
        classKey: selectedClass,
        results: marksData
      });

      alert("Results published successfully!");
      // Reload results to show published status
      loadResultsForClass(selectedClass);
    } catch (error) {
      console.error("Failed to publish results:", error);
      alert("Failed to publish results. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  /* ================= DOWNLOAD REPORT ================= */
  const downloadReport = () => {
    const csvContent = [
      ['Roll No', 'Student Name', 'Admission No', 'Marks', 'Grade', 'Status', 'Remarks'],
      ...results.map(r => [
        r.studentId?.rollNo || '',
        r.studentId?.name || '',
        r.studentId?.admissionNo || '',
        r.marks || '',
        r.grade || '',
        r.status || '',
        r.remarks || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${selectedClass}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  /* ================= HANDLE CLASS CHANGE ================= */
  const handleClassChange = (classKey) => {
    setSelectedClass(classKey);
    loadResultsForClass(classKey);
  };

  /* ================= GET STATUS COLOR ================= */
  const getStatusColor = (status) => {
    switch (status) {
      case 'PASS':
        return 'bg-green-500/20 text-green-400';
      case 'FAIL':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
        <div className="text-white">Loading exam data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold">Publish Results</h1>
              <p className="text-gray-400 mt-2">
                {exam?.title} - {exam?.subject}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={downloadReport}
                disabled={results.length === 0}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-medium transition"
              >
                📊 Download Report
              </button>
              <button
                onClick={publishResults}
                disabled={publishing || results.length === 0}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-medium transition"
              >
                {publishing ? "Publishing..." : "🚀 Publish Results"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-6 gap-4 mb-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-gray-400 text-xs">Total Students</h3>
            <p className="text-2xl font-bold mt-1">{stats.totalStudents}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-gray-400 text-xs">Passed</h3>
            <p className="text-2xl font-bold mt-1 text-green-400">{stats.passedStudents}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-gray-400 text-xs">Failed</h3>
            <p className="text-2xl font-bold mt-1 text-red-400">{stats.failedStudents}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-gray-400 text-xs">Pass Rate</h3>
            <p className="text-2xl font-bold mt-1 text-blue-400">{stats.passRate}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-gray-400 text-xs">Average</h3>
            <p className="text-2xl font-bold mt-1">{stats.averageMarks}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <h3 className="text-gray-400 text-xs">Highest</h3>
            <p className="text-2xl font-bold mt-1 text-purple-400">{stats.highestMarks}</p>
          </div>
        </motion.div>

        {/* Class Selection */}
        {examClasses.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <label className="block text-sm font-medium mb-2">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:border-blue-500 focus:outline-none w-full max-w-md"
            >
              <option value="">Choose a class</option>
              {examClasses.map((c, idx) => (
                <option key={idx} value={`${c.classId._id}_${c.section}`}>
                  {c.classId.name} - Section {c.section}
                </option>
              ))}
            </select>
          </motion.div>
        )}

        {/* Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden"
        >
          {results.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">
                {selectedClass ? "No results found for this class" : "Please select a class to view results"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left p-4 font-semibold">Roll No</th>
                    <th className="text-left p-4 font-semibold">Student Name</th>
                    <th className="text-left p-4 font-semibold">Admission No</th>
                    <th className="text-left p-4 font-semibold">Marks</th>
                    <th className="text-left p-4 font-semibold">Grade</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <motion.tr
                      key={result._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/10 hover:bg-white/5 transition"
                    >
                      <td className="p-4">{result.studentId?.rollNo || '-'}</td>
                      <td className="p-4 font-medium">{result.studentId?.name || '-'}</td>
                      <td className="p-4 text-gray-400">{result.studentId?.admissionNo || '-'}</td>
                      <td className="p-4 font-semibold">{result.marks || '-'}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium">
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(result.status)}`}>
                          {result.status || '-'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{result.remarks || '-'}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Publish Confirmation */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mt-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-400">🚀 Ready to Publish</h3>
                <p className="text-gray-400 mt-1">
                  Publishing will make these results visible to students and parents
                </p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/teacher/exams/view/${examId}`)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl font-medium transition"
                >
                  Review Later
                </button>
                <button
                  onClick={publishResults}
                  disabled={publishing}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-medium transition"
                >
                  {publishing ? "Publishing..." : "Publish Now"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
