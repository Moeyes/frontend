/**
 * API Client
 * 
 * Axios instance with interceptors for authentication and error handling
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { constants } from '@/config/constants';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: constants.api.baseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: attach auth token if present
apiClient.interceptors.request.use(
    (config) => {
        // Future-proof: attach Bearer token from localStorage if available
        const token = typeof window !== 'undefined'
            ? localStorage.getItem('auth_token')
            : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: normalize error shape
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        // Normalize error response
        if (error.response) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject({
            detail: error.message || 'An unexpected error occurred',
        });
    }
);

export default apiClient;
