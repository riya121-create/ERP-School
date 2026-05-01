import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const sessionToken = localStorage.getItem("teacherSessionToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 🔥 VERY IMPORTANT FOR TEACHER
  if (sessionToken) {
    config.headers["x-session-token"] = sessionToken;
  }

  return config;
});

export default api;
