/**
 * Application Routes
 * 
 * Define all routes in your application here for type-safe navigation
 */

export const routes = {
    home: '/',
    register: '/register',
    login: '/login',
    survey: '/survey',
    bynumber: '/bynumber',
    dashboard: '/dashboard',
    events: '/events',
    eventDetail: (id: number) => `/events/${id}`,
    sports: '/sports',
    sportDetail: (id: number) => `/sports/${id}`,
    users: '/users',
    userDetail: (id: number) => `/users/${id}`,
} as const;

export type RouteKey = keyof typeof routes;
