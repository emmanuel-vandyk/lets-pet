import axios from "axios"

const BACKEND_URL_PROD = process.env.NEXT_PUBLIC_BACKEND_URL;


if (!BACKEND_URL_PROD) {
    throw new Error('La variable de entorno no está definida');
} 

const api = axios.create({
    baseURL: BACKEND_URL_PROD,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;