import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── Primary API instance ───────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // required for the refreshToken cookie
});

// ── Separate instance ONLY for the refresh call ────────────────
// This instance has NO response interceptor, so a 401 from the
// refresh endpoint does NOT trigger another refresh (no infinite loop).
const refreshApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // must send the refreshToken cookie
});

// ── Simultaneous-request queue ─────────────────────────────────
// If multiple requests fail with 401 at the same time, only ONE
// refresh is performed. All other failed requests wait for it.
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
}

// ── Request interceptor: attach access token ───────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 → refresh → retry ────────
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh on 401 and only once per request.
    // Also skip if this is already a refresh request (belt-and-suspenders guard).
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // ── If a refresh is already in-flight, queue this request ──
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ── Start the refresh ──────────────────────────────────────
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Use the separate refreshApi instance — no interceptors,
      // no infinite loop risk.
      const response = await refreshApi.post("/auth/refresh");

      const newAccessToken: string = response.data.accessToken;

      // Persist the new token
      localStorage.setItem("accessToken", newAccessToken);

      // Update the default header for future requests
      api.defaults.headers.common["Authorization"] =
        `Bearer ${newAccessToken}`;

      // Release the queue with the new token
      processQueue(null, newAccessToken);

      // Retry the original request with the new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);

    } catch (refreshError) {
      // Refresh failed — reject all queued requests and log out
      processQueue(refreshError, null);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");

      window.location.href = "/signin";

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;