/**
 * Application Constants
 * 
 * Global constants used throughout the application
 */

export const constants = {
    app: {
        name: 'Choschmous',
        version: '1.0.0',
    },
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    },
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
    },
} as const;
