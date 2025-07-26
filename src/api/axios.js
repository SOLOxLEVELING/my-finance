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

// NEW: Add an interceptor to handle 401 errors globally
apiClient.interceptors.response.use(
  (response) => {
    // If the request was successful, just return the response
    return response;
  },
  (error) => {
    // If the error is a 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear the user's session from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("accountId");
      localStorage.removeItem("currency");

      // Redirect to the login page
      // This is a safe way to handle navigation outside of a React component
      window.location.href = "/login";
    }

    // For any other error, just reject the promise
    return Promise.reject(error);
  }
);

export default apiClient;
