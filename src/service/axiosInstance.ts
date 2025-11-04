import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';
import { toast } from 'react-toastify';

const BACKEND_URI = process.env.NEXT_PUBLIC_BACKEND_URI
console.log("BACKEND_URI", BACKEND_URI);
const axiosInstance = axios.create({
  baseURL: BACKEND_URI,
  
});

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (error: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// Safe helpers to avoid accessing `localStorage` or `window` in server/runtime contexts
const isClient = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';
const safeGet = (key: string): string | null => {
  try {
    if (typeof window !== "undefined")
      // return null
    return isClient() && typeof localStorage.getItem === 'function' ? localStorage.getItem(key) : null;
    else return null;
  } catch (e) {
    return null;
  }
};
const safeSet = (key: string, value: string) => {
  try {
    if (isClient() && typeof localStorage.setItem === 'function') localStorage.setItem(key, value);
  } catch (e) {
    /* swallow */
  }
};
const safeRemove = (key: string) => {
  try {
    if (isClient() && typeof localStorage.removeItem === 'function') localStorage.removeItem(key);
  } catch (e) {
    /* swallow */
  }
};
const safeRedirectToLogin = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = safeGet('accessToken');
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = safeGet('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found');

        const response = await axios.post<{ accessToken: string }>(
          `${BACKEND_URI}/auth/refresh`,
          { refreshToken }
        );

        const newAccessToken = response.data.accessToken;
        safeSet('accessToken', newAccessToken);
        axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        safeRemove('accessToken');
        safeRemove('refreshToken');
        if (typeof window !== 'undefined') {
          // Only show toast / redirect on client
          toast.error('Session expired. Please log in again.');
          safeRedirectToLogin();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
