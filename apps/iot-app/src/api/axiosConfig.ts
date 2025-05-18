import { toast } from "react-hot-toast";

import axios, { InternalAxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
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

apiClient.interceptors.response.use(
  response => response,
  async error => {
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
        const refreshResponse = await axios.post<{ accessToken: string }>(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
          },
        );

        const newAccessToken = refreshResponse.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
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
