import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { attachCrossCuttingHeaders } from './headers';

const apiClient: AxiosInstance = axios.create({
    baseURL: '/',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true, // sends HttpOnly cookies on every request automatically
});

// Request interceptor: attach correlation id + CSRF token centrally. No auth
// token is attached here — the browser sends the HttpOnly cookies itself.
apiClient.interceptors.request.use(attachCrossCuttingHeaders);

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