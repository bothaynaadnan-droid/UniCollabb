import axios from 'axios';

const ACCESS_TOKEN_KEY = 'uc_access_token';
const REFRESH_TOKEN_KEY = 'uc_refresh_token';

export const tokenStorage = {
  getAccessToken() {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },
  setAccessToken(token) {
    try {
      if (!token) localStorage.removeItem(ACCESS_TOKEN_KEY);
      else localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (e) {}
  },
  getRefreshToken() {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (e) {
      return null;
    }
  },
  setRefreshToken(token) {
    try {
      if (!token) localStorage.removeItem(REFRESH_TOKEN_KEY);
      else localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (e) {}
  },
  clear() {
    this.setAccessToken(null);
    this.setRefreshToken(null);
  }
};

// In dev: with CRA proxy keep this empty and call '/api/...'
// In prod: set REACT_APP_API_BASE_URL to something like 'https://api.example.com'
// (also supports legacy REACT_APP_API_BASE)
let baseURL = (
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_BASE ||
  ''
).trim();

// Normalize common misconfig: if baseURL ends with '/api', strip it
if (baseURL.endsWith('/api')) {
  baseURL = baseURL.slice(0, -4);
}

export const api = axios.create({
  baseURL,
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const res = await axios.post(
    `${baseURL}/api/user/refresh-token`,
    { refreshToken },
    { withCredentials: false }
  );

  const data = res?.data?.data;
  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error('Invalid refresh response');
  }

  tokenStorage.setAccessToken(data.accessToken);
  tokenStorage.setRefreshToken(data.refreshToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    // Only retry once
    if (!originalRequest || originalRequest.__isRetryRequest) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const code = error?.response?.data?.code;

    if (status === 401 && code === 'TOKEN_EXPIRED') {
      try {
        originalRequest.__isRetryRequest = true;

        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = refreshAccessToken().finally(() => {
            isRefreshing = false;
          });
        }

        await refreshPromise;
        return api(originalRequest);
      } catch (refreshErr) {
        tokenStorage.clear();
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);
