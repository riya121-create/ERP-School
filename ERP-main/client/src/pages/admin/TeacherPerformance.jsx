import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

function TeacherPerformance() {
  const navigate = useNavigate();
  const { teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    evaluationPeriod: "",
    criteria: [
      { name: "Teaching Skills", description: "Classroom instruction and delivery", weight: 1 },
      { name: "Classroom Management", description: "Maintaining discipline and engagement", weight: 1 },
      { name: "Communication", description: "Interaction with students and parents", weight: 1 },
      { name: "Professionalism", description: "Punctuality, attitude, and collaboration", weight: 1 }
    ],
    ratings: [],
    comments: "",
    overallRating: 3
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get teacher info
        const teacherRes = await api.get(`/admin/teachers/${teacherId}`);
        setTeacher(teacherRes.data.teacher);

        // Get performance history
        const performanceRes = await api.get(`/admin/teachers/${teacherId}/performance`);
        setPerformances(performanceRes.data.performances || []);
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

  const handleRatingChange = (criterionIndex, score) => {
    setFormData(prev => ({
      ...prev,
      ratings: prev.ratings.filter(r => r.criterion !== prev.criteria[criterionIndex].name).concat({
        criterion: prev.criteria[criterionIndex].name,
        score: parseInt(score)
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post(`/admin/teachers/${teacherId}/performance`, {
        ...formData,
        overallRating: parseInt(formData.overallRating)
      });
      alert("Performance evaluation saved successfully!");
      
      // Reset form
      setFormData(prev => ({
        ...prev,
        evaluationPeriod: "",
        ratings: [],
        comments: "",
        overallRating: 3
      }));

      // Refresh performances list
      const performanceRes = await api.get(`/admin/teachers/${teacherId}/performance`);
      setPerformances(performanceRes.data.performances || []);
    } catch (error) {
      console.error("Failed to save performance:", error);
      alert(error.response?.data?.message || "Failed to save performance evaluation");
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
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
          <h1 className="text-3xl font-bold">Performance Management</h1>
          <p className="text-gray-500 mt-1">
            Manage performance for: <span className="font-semibold">{teacher.name}</span>
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/teachers")}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back to Teachers
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* PERFORMANCE EVALUATION FORM */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-lg font-semibold mb-4">New Performance Evaluation</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Evaluation Period *</label>
                <input
                  type="text"
                  value={formData.evaluationPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, evaluationPeriod: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="e.g., Q1 2024, Academic Year 2023-24"
                  required
                />
              </div>

              {/* CRITERIA RATINGS */}
              <div className="space-y-3">
                <h3 className="font-medium mb-2">Performance Criteria (1-5 Scale)</h3>
                {formData.criteria.map((criterion, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{criterion.name}</div>
                        <div className="text-sm text-gray-500">{criterion.description}</div>
                      </div>
                      <div className="text-sm text-gray-500">Weight: {criterion.weight}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">1</span>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={formData.ratings.find(r => r.criterion === criterion.name)?.score || 3}
                        onChange={(e) => handleRatingChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <span className="text-sm">5</span>
                      <span className="font-bold ml-2">
                        {formData.ratings.find(r => r.criterion === criterion.name)?.score || 3}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* OVERALL RATING */}
              <div>
                <label className="block text-sm font-medium mb-1">Overall Rating *</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.overallRating}
                    onChange={(e) => setFormData(prev => ({ ...prev, overallRating: e.target.value }))}
                    className="flex-1"
                  />
                  <span className={`font-bold text-lg ${getRatingColor(formData.overallRating)}`}>
                    {formData.overallRating} {getStars(Math.round(formData.overallRating))}
                  </span>
                </div>
              </div>

              {/* COMMENTS */}
              <div>
                <label className="block text-sm font-medium mb-1">Comments *</label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Enter detailed feedback and observations"
                  required
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Performance Evaluation"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* PERFORMANCE HISTORY */}
        <div className="bg-white rounded-xl shadow p-8">
          <h2 className="text-lg font-semibold mb-4">Performance History</h2>
          <div className="space-y-4">
            {performances.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No performance evaluations found
              </div>
            ) : (
              performances.map(performance => (
                <div key={performance._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium">{performance.evaluationPeriod}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(performance.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${getRatingColor(performance.overallRating)}`}>
                      {performance.overallRating} {getStars(Math.round(performance.overallRating))}
                    </div>
                  </div>

                  {/* DETAILED RATINGS */}
                  {performance.ratings && performance.ratings.length > 0 && (
                    <div className="mb-3">
                      <h4 className="font-medium text-sm mb-2">Detailed Ratings:</h4>
                      <div className="space-y-1">
                        {performance.ratings.map((rating, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{rating.criterion}:</span>
                            <span className="font-medium">{rating.score}/5</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COMMENTS */}
                  {performance.comments && (
                    <div className="text-sm">
                      <div className="font-medium mb-1">Feedback:</div>
                      <div className="text-gray-600">{performance.comments}</div>
                    </div>
                  )}

                  {/* EVALUATOR */}
                  {performance.evaluatedBy && (
                    <div className="text-sm text-gray-500 mt-2">
                      Evaluated by: {performance.evaluatedBy.name}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherPerformance;
