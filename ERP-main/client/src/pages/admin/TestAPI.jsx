import { useState } from "react";
import api from "../../services/api";

function TestAPI() {
  const [results, setResults] = useState([]);

  const testAPI = async () => {
    const tests = [
      { name: "Subjects", url: "/admin/subjects" },
      { name: "Teachers", url: "/admin/teachers" },
      { name: "Classes", url: "/admin/classes" }
    ];

    const testResults = [];

    for (const test of tests) {
      try {
        console.log(`Testing ${test.name}...`);
        const res = await api.get(test.url);
        console.log(`${test.name} response:`, res.data);
        testResults.push({
          test: test.name,
          status: "Success",
          data: res.data
        });
      } catch (error) {
        console.error(`${test.name} error:`, error);
        console.error(`${test.name} response:`, error.response);
        testResults.push({
          test: test.name,
          status: "Failed",
          error: error.response?.data?.message || error.message
        });
      }
    }

    setResults(testResults);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API Test</h1>
      
      <button
        onClick={testAPI}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Test All APIs
      </button>

      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${
              result.status === "Success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            }`}
          >
            <div className="font-semibold">{result.test}</div>
            <div className={`text-sm ${result.status === "Success" ? "text-green-700" : "text-red-700"}`}>
              Status: {result.status}
            </div>
            {result.error && (
              <div className="text-sm text-red-600">
                Error: {result.error}
              </div>
            )}
            {result.data && (
              <div className="text-xs text-gray-600 mt-2">
                Data: {JSON.stringify(result.data, null, 2)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestAPI;
