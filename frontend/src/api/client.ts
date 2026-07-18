import axios from 'axios';
import { auth } from '../firebase/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to attach Firebase ID Token dynamically
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Wait for Firebase Auth to complete its initial state check
      await auth.authStateReady();
    } catch (authErr) {
      console.error("Firebase Auth initialization failed/timed out in request interceptor:", authErr);
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (err) {
        console.error("Failed to get Firebase auth token in request interceptor:", err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to parse responses and handle automatic 401 token recovery/retry
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res && res.success !== undefined) {
      if (res.success) {
        return res;
      } else {
        return Promise.reject(new Error(res.message || 'Backend API returned failure.'));
      }
    }
    return res;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Session Expiration and Token Recovery
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const user = auth.currentUser;
      if (user) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        isRefreshing = true;

        try {
          // Attempt to force refresh the Firebase ID token once
          const newToken = await user.getIdToken(true);
          processQueue(null, newToken);
          isRefreshing = false;

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;

          // If token refresh fails, dispatch session expiration to clean up state
          window.dispatchEvent(new CustomEvent('rih_session_expired'));
          return Promise.reject(new Error("Session expired. Token refresh failed."));
        }
      } else {
        // If there's no user logged in, dispatch session expiration
        window.dispatchEvent(new CustomEvent('rih_session_expired'));
      }
    }

    const message = error.response?.data?.message || error.message || 'Network operation failed.';
    return Promise.reject(new Error(message));
  }
);
