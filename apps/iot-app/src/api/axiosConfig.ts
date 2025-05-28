import { toast } from "react-hot-toast";

import axios, { InternalAxiosRequestConfig } from "axios";

// Get API URL from environment or default to server proxy
const apiUrl = import.meta.env.VITE_API_URL || "";

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: apiUrl,
  // Disable withCredentials for testing since we use token auth
  withCredentials: false,
  // Increase timeout for slower connections
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to check API health
export const checkApiHealth = async () => {
  try {
    // Try the root endpoint first

    // If we got here, the API is reachable
    return true;
  } catch (rootError) {
    console.error("API root check failed:", rootError);

    // All health  checks failed
    return false;
  }
};

// Minimal request logging in development
apiClient.interceptors.request.use(
  config => {
    // Only log in development and at debug level
    if (process.env.NODE_ENV === "development" && localStorage.getItem("debug_api") === "true") {
      console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error("Request error:", error);
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: Error) => void }[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Direct login function that bypasses interceptors for debugging
export const directLogin = async (email: string, password: string) => {
  try {
    const fullLoginUrl = `${apiUrl}/api/auth/login`;

    // Try with absolute URL first
    const response = await axios.post(
      fullLoginUrl,
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: false,
        timeout: 10000,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Direct login failed:", error);
    throw error;
  }
};

// Minimal response logging
apiClient.interceptors.response.use(
  response => {
    // Only log in development and at debug level
    if (process.env.NODE_ENV === "development" && localStorage.getItem("debug_api") === "true") {
      console.log(`Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  async error => {
    // Show specific error if it's a CORS issue
    if (error.message.includes("Network Error") || !error.response) {
      console.error("Potential CORS issue - check server CORS configuration");
      // Check if API is actually reachable
      const isApiHealthy = await checkApiHealth();

      if (!isApiHealthy) {
        toast.error("Server unreachable. Please try again later.");
      } else {
        toast.error("Network error. Possible CORS issue.");
      }
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        isRefreshing = false;
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete apiClient.defaults.headers.common["Authorization"];
        window.location.href = "/login";
        return Promise.reject(new Error("No refresh token available."));
      }

      try {
        // Use the full URL for refresh token requests to avoid CORS issues
        const fullRefreshUrl = `${apiUrl}/api/auth/refresh`;

        const refreshResponse = await axios.post<{ accessToken: string }>(
          fullRefreshUrl,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: false,
          },
        );

        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        const errorToProcess =
          refreshError instanceof Error ? refreshError : new Error("Token refresh failed");
        processQueue(errorToProcess, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        delete apiClient.defaults.headers.common["Authorization"];
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(errorToProcess);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
