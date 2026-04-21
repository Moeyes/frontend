import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const KEYS = { ACCESS: 'auth_access_token' } as const;

const ss = {
    get: (k: string) => { try { return sessionStorage.getItem(k); } catch { return null; } },
    set: (k: string, v: string) => { try { sessionStorage.setItem(k, v); } catch { } },
    remove: (k: string) => { try { sessionStorage.removeItem(k); } catch { } },
};

// ── Public helpers used by AuthContext ────────────────────────────────────────
export const getStoredToken = () => ss.get(KEYS.ACCESS);
export const setStoredToken = (t: string) => ss.set(KEYS.ACCESS, t);
export const clearStoredTokens = () => ss.remove(KEYS.ACCESS);

// No refresh token helpers — it lives in an HttpOnly cookie, JS cannot read it

const apiClient: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,  // ✅ CRITICAL — sends the HttpOnly refresh_token cookie automatically
});

// ── Request: attach Bearer access token ───────────────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ── Response: silent refresh on 401 ──────────────────────────────────────────
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

const drainQueue = (token: string) => { queue.forEach(cb => cb(token)); queue = []; };

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
                queue.push((token: string) => {
                    original.headers!.Authorization = `Bearer ${token}`;
                    resolve(apiClient(original));
                });
            });
        }

        isRefreshing = true;

        try {
            // ✅ No body needed — browser sends the HttpOnly cookie automatically
            const { data } = await axios.post(
                `${apiClient.defaults.baseURL}/api/auth/refresh`,
                {},
                { withCredentials: true }
            );

            setStoredToken(data.access_token);
            original.headers!.Authorization = `Bearer ${data.access_token}`;
            drainQueue(data.access_token);
            return apiClient(original);
        } catch {
            clearStoredTokens();
            queue = [];
            window.dispatchEvent(new CustomEvent('auth:session-expired'));
            return Promise.reject(error);
        } finally {
            isRefreshing = false;
        }
    }
);

export default apiClient;