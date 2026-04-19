/**
 * Application Routes
 * 
 * Define all routes in your application here for type-safe navigation
 */

export const routes = {
    home: '/',
    // Add your routes here
    // example: '/products',
    // about: '/about',
} as const;

export type RouteKey = keyof typeof routes;
