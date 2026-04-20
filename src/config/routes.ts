/**
 * Application Routes
 * 
 * Define all routes in your application here for type-safe navigation
 */

export const routes = {
    home: '/',
    register: '/auth/register',
    login: '/auth/login',
} as const;

export type RouteKey = keyof typeof routes;
