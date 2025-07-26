import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3001/api",
});

// Attach the token to every request if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
