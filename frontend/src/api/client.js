import axios from 'axios';
import { logEvent } from '../utils/logger'; // ✅ import once

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000
});

// Attach token automatically
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log every request & response
client.interceptors.request.use(async (config) => {
  await logEvent('info', `HTTP Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

client.interceptors.response.use(
  async (response) => {
    await logEvent('info', `HTTP Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    await logEvent('error', `HTTP Error: ${error?.response?.status || 'Network Error'}`, {
      url: error?.config?.url,
      message: error.message,
    });

    if (error?.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (location.pathname !== '/login') location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default client;
