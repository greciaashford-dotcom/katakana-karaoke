import axios from "axios";

const backendUrl = process.env.REACT_APP_BACKEND_URL;
if (!backendUrl) throw new Error("REACT_APP_BACKEND_URL no está configurada");

export const api = axios.create({ baseURL: `${backendUrl}/api`, timeout: 30000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("okume-admin-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});