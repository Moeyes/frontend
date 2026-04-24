import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const apiClient: AxiosInstance = axios.create({
    baseURL: '/',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // sends HttpOnly cookies on every request automatically
});

// No request interceptor — no token to attach, browser handles cookies

let isRefreshing = false;
let queue: Array<() => void> = [];

const drainQueue = () => { queue.forEach(cb => cb()); queue = []; };

apiClient.interceptors.response.use(
    res => res,
    async (error: AxiosError) => {
        const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (
            error.response?.status !== 401 ||
            original._retry ||
            original.url?.includes('/refresh')
        ) {
            return Promise.reject(error);
        }

        original._retry = true;

        if (isRefreshing) {
            return new Promise(resolve => {
                queue.push(() => resolve(apiClient(original)));
            });
        }

        isRefreshing = true;

        try {
            await axios.post('/api/auth/refresh', {}, { withCredentials: true });
            drainQueue();
            return apiClient(original);
        } catch {
            queue = [];
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;