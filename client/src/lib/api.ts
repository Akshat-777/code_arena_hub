import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://code-arena-hub-1.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("code_arena_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

