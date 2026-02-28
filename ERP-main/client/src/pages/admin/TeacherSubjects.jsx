import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function TeacherSubjects() {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data for teacherId:", teacherId);
        
        // Get teacher info
        const teacherRes = await api.get(`/admin/teachers/${teacherId}`);
        console.log("Teacher response:", teacherRes.data);
        setTeacher(teacherRes.data.teacher);

        // Get all available subjects
        const subjectsRes = await api.get('/admin/subjects');
        console.log("Subjects response:", subjectsRes.data);
        setSubjects(subjectsRes.data || []);

        // Get teacher's current subjects
        const teacherSubjectsRes = await api.get(`/admin/teachers/${teacherId}/subjects`);
        console.log("Teacher subjects response:", teacherSubjectsRes.data);
        setSelectedSubjects(teacherSubjectsRes.data.subjects?.map(s => s._id) || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        alert(`Failed to load data: ${error.response?.data?.message || error.message}`);
      }
    };

    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/admin/teachers/${teacherId}/subjects`, {
        subjectIds: selectedSubjects
      });
      alert("Subjects assigned successfully!");
      navigate("/admin/teachers");
    } catch (error) {
      console.error("Failed to assign subjects:", error);
      alert(error.response?.data?.message || "Failed to assign subjects");
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
          <h1 className="text-3xl font-bold">Assign Subjects</h1>
          <p className="text-gray-500 mt-1">
            Manage subjects for: <span className="font-semibold">{teacher.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Teachers
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-8">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Available Subjects</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <label
                  key={subject._id}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject._id)}
                    onChange={() => handleSubjectToggle(subject._id)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-sm text-gray-500">
                      {subject.code} • {subject.type} • {subject.department}
                    </div>
                    <div className="text-xs text-gray-400">
                      {subject.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* CURRENTLY ASSIGNED */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Currently Assigned ({selectedSubjects.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedSubjects.map(subjectId => {
                const subject = subjects.find(s => s._id === subjectId);
                return subject ? (
                  <span
                    key={subjectId}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {subject.name}
                  </span>
                ) : null;
              })}
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
              {loading ? "Saving..." : "Assign Subjects"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TeacherSubjects;
