import { toast } from "react-hot-toast";

import axios, { InternalAxiosRequestConfig } from "axios";

// Log API URL for debugging
const apiUrl = import.meta.env.VITE_API_URL;
console.log("VITE_API_URL at runtime:", apiUrl);

if (!apiUrl) {
  console.error("VITE_API_URL is not defined. API calls will likely fail.");
}

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
    console.log(`Checking API health at ${apiUrl}`);
    const rootResponse = await axios.get(`${apiUrl}`, {
      timeout: 5000,
      withCredentials: false,
    });
    console.log("API root endpoint response:", rootResponse.data);

    // If we got here, the API is reachable
    return true;
  } catch (rootError) {
    console.error("API root check failed:", rootError);

    // Try multiple health endpoints as fallbacks
    const healthPaths = ["/health", "/api/health"];

    for (const path of healthPaths) {
      try {
        console.log(`Trying health endpoint at ${apiUrl}${path}`);
        const healthResponse = await axios.get(`${apiUrl}${path}`, {
          timeout: 5000,
          withCredentials: false,
        });
        console.log(`Health check at ${path} succeeded:`, healthResponse.data);
        return true;
      } catch (healthError) {
        console.error(`Health check at ${path} failed:`, healthError);
      }
    }

    // All health checks failed
    return false;
  }
};

// Log all requests in development
apiClient.interceptors.request.use(
  config => {
    // Add API URL logging for debugging
    console.log(`Full request URL: ${config.baseURL}${config.url}`);
    console.log(`Request: ${config.method?.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      baseURL: config.baseURL,
      data: config.data,
    });

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
    console.log(`Attempting direct login to ${fullLoginUrl}`);

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

    console.log("Direct login successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Direct login failed:", error);
    throw error;
  }
};

// Log all responses and handle errors
apiClient.interceptors.response.use(
  response => {
    console.log(`Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  async error => {
    console.error("API Error:", error.message);
    console.error("Error details:", {
      config: error.config,
      response: error.response,
      request: error.request,
    });

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
        console.log("Refreshing token at:", fullRefreshUrl);

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
