/**
 * Application Routes
 *
 * All routes in the application for type-safe navigation
 */

export const FORM_STEPS = ['event', 'personal', 'documents', 'review', 'verification'] as const;

export const FORM_STEP_LABELS: Record<typeof FORM_STEPS[number], string> = {
    event: 'Event Selection',
    personal: 'Personal Information',
    documents: 'Document Upload',
    review: 'Review',
    verification: 'Verification',
};

// Gender options
export const GENDER_OPTIONS = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
] as const;

// ID document types
export const ID_DOCUMENT_OPTIONS = [
    { value: 'NATIONAL_ID', label: 'National ID' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'DRIVER_LICENSE', label: 'Driver License' },
] as const;

// Role options
export const ROLE_OPTIONS = [
    { value: 'Athlete', label: 'Athlete' },
    { value: 'Leader', label: 'Leader' },
] as const;

// Leader role options
export const LEADER_ROLE_OPTIONS = [
    { value: 'Coach', label: 'Coach' },
    { value: 'Manager', label: 'Manager' },
    { value: 'Official', label: 'Official' },
    { value: 'Medical', label: 'Medical Staff' },
] as const;


export const routes = {
    // Public
    home: '/',

    // Auth routes
    login: '/login',

    // Public registration (guest + org + admin)
    register: '/register',

    // Portal routes (authenticated)
    dashboard: '/dashboard',
    bynumber: '/bynumber',
    bySport: '/bysport',
    byCategory: '/bycategory',

    // Error pages
    unauthorized: '/unauthorized',
} as const;

export type RouteKey = keyof typeof routes;

/**
 * Role-based default redirect after login
 */
// import { UserRole } from '@/features/auth/types';

import { UserRole } from '@/features/auth/types';

export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
    [UserRole.ADMIN]: '/dashboard',
    [UserRole.ORGANIZATION]: '/dashboard',
    [UserRole.FEDERATION]: '/by-category',
    [UserRole.GUEST]: '/register',
};