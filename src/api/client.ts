import axios from 'axios';
import { config } from '../config/environment';
import { useAuthStore } from '../state/authStore';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (error?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject bearer token
apiClient.interceptors.request.use(
  (config) => {
    const authState = useAuthStore.getState();
    const accessToken = authState?.accessToken;
    // Skip auth for discovery endpoints
    if (accessToken && !config.url?.startsWith('/discovery')) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle token refresh logic
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const authState = useAuthStore.getState();
    const refreshToken = authState?.refreshToken;
    const { setTokens, clearTokens } = authState?.actions || {};

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (!refreshToken) {
        clearTokens();
        // Redirect to login would happen here at the app level
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, { refreshToken });
        const newTokens = {
          accessToken: data.data.tokens.accessToken,
          refreshToken: data.data.tokens.refreshToken,
        };
        setTokens(newTokens);

        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        processQueue(null, newTokens.accessToken);

        return axios(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();
        // Redirect to login would happen here
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
