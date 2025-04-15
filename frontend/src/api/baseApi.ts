import axios from "axios";

// Determinar automáticamente si estamos en desarrollo local o producción
const isDevelopment = process.env.NODE_ENV === "development";

// URL del backend
const BACKEND_URL = isDevelopment
  ? "http://localhost:8080/api" // URL local para desarrollo
  : process.env.NEXT_PUBLIC_BACKEND_URL ||
    "https://lets-pet-backend.vercel.app/api";

console.log(`Usando backend en: ${BACKEND_URL}`);

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export default api;
