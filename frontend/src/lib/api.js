import axios from "axios";
import { getToken, clearAuth } from "./auth";

export const api = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // If backend returns 401, wipe auth so UI doesn’t get stuck
    if (err?.response?.status === 401) clearAuth();
    return Promise.reject(err);
  }
);
