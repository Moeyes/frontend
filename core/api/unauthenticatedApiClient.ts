/**
 * Unauthenticated API Client
 *
 * Axios instance for public endpoints that don't require auth tokens.
 */

import axios, { type AxiosInstance, AxiosError } from 'axios';

const unauthenticatedApiClient: AxiosInstance = axios.create({
    baseURL: '/',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Response interceptor: normalize error shape (same as auth client)
unauthenticatedApiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response) {
            return Promise.reject(error.response.data);
        }
        return Promise.reject({
            detail: error.message || 'An unexpected error occurred',
        });
    }
);

export default unauthenticatedApiClient;