/**
 * Application Constants
 * 
 * Global constants used throughout the application
 */

import { env } from '@/env';
import { UserRole } from '@/core/auth/types';

export { routes } from './routes';
export type { RouteKey } from './routes';

export const constants = {
    app: {
        name: 'Moeys Sports',
        version: '1.0.0',
    },
    api: {
        baseUrl: env.NEXT_PUBLIC_API_URL,
    },
    pagination: {
        defaultPageSize: 10,
        maxPageSize: 100,
    },
    registration: {
        minPhoneLength: 7,
        maxPhoneLength: 15,
        minIdDocumentLength: 6,
        maxIdDocumentLength: 20,
        maxImageSize: 2 * 1024 * 1024, // 2MB
    },
} as const;

/**
 * Role-based default redirect after login
 */
export const ROLE_DEFAULT_ROUTE: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: '/dashboard',
    [UserRole.ADMIN]: '/dashboard',
    [UserRole.ORGANIZATION]: '/dashboard',
    [UserRole.FEDERATION]: '/bycategory',
    [UserRole.GUEST]: '/register',
};

// Registration Form Constants
export const FORM_STEPS = ['event', 'personal', 'documents', 'review'] as const;
export const FORM_STEP_LABELS = {
    event: 'Event',
    personal: 'Personal',
    documents: 'Documents',
    review: 'Review',
} as const;

export const GENDER_OPTIONS = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
];

export const ID_DOCUMENT_OPTIONS = [
    { value: 'IDCARD', label: 'ID Card' },
    { value: 'BIRTHCERTIFICATE', label: 'Birth Certificate' },
    { value: 'PASSPORT', label: 'Passport' },
    { value: 'FAMILYBOOK', label: 'Family Book' },
    { value: 'OTHER', label: 'Other' },
];

export const ROLE_OPTIONS = [
    { value: 'athlete', label: 'Athlete' },
    { value: 'leader', label: 'Leader' },
];

export const LEADER_ROLE_OPTIONS = [
    { value: 'coach', label: 'Coach' },
    { value: 'manager', label: 'Manager' },
    { value: 'delegate', label: 'Delegate' },
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'coach_trainer', label: 'Coach Trainer' },
    { value: 'teacher_assistant', label: 'Teacher Assistant' },
] as const;

export const CLOUDINARY_FOLDERS = {
    photos: 'domrov-pictures',
    documents: 'domrov-documents',
} as const;
