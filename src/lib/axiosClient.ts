// src/lib/axiosClient.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const axiosClient = axios.create({
    baseURL: 'http://localhost:8080', // URL base de tu API
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('jwtToken'); // Descomentar cuando implementes JWT
         if (token) {
        config.headers.Authorization = `Bearer ${token}`;
         }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosClient;