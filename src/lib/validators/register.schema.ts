/**
 * Registration Form Validator Schema
 * 
 * Zod schema for client-side validation of registration form data
 */

import { z } from 'zod';

// Phone regex: 7-15 digits
const phoneRegex = /^\d{7,15}$/;

// Date must be in the past (user's birth date)
const pastDateSchema = z.string().refine(
    (date) => {
        const d = new Date(date);
        return !isNaN(d.getTime()) && d <= new Date();
    },
    'Birth date must be today or earlier'
);

export const registerSchema = z.object({
    // Context selection - all required
    eventType: z.string().min(1, 'Event Type is required').nullable(),
    eventId: z.coerce.number().int().positive('Event is required').nullable(),
    organizationId: z.coerce.number().int().positive('Organization is required').nullable(),
    sportId: z.coerce.number().int().positive('Sport is required').nullable(),
    categoryId: z.coerce.number().int().positive().nullable(),

    // Personal information
    khFamilyName: z.string().trim().min(1, 'Khmer family name is required'),
    khGivenName: z.string().trim().min(1, 'Khmer given name is required'),
    enFamilyName: z.string().trim().min(1, 'English family name is required'),
    enGivenName: z.string().trim().min(1, 'English given name is required'),
    gender: z.enum(['Male', 'Female'], {
        errorMap: () => ({ message: 'Please select a gender' }),
    }),
    dateOfBirth: pastDateSchema,
    nationality: z
        .string()
        .trim()
        .min(1, 'Nationality is required')
        .default('Cambodian'),
    phone: z
        .string()
        .trim()
        .regex(phoneRegex, 'Phone must be 7-15 digits'),
    idDocumentType: z.enum(['IDCard', 'BirthCertificate', 'Passport', 'FamilyBook', 'Other']),
    address: z.string().trim().optional(),

    // Role information
    role: z.enum(['Athlete', 'Leader']),
    leaderRole: z.string().trim().optional(),

    // Document paths
    photoPath: z.string().url().optional().nullable(),
    birthCertificatePath: z.string().url().optional().nullable(),
    nationalIdPath: z.string().url().optional().nullable(),
    passportPath: z.string().url().optional().nullable(),

    // Document upload toggles (UI-only, not sent to backend)
    _uploadPhoto: z.boolean().optional(),
    _uploadId: z.boolean().optional(),
    _uploadBirth: z.boolean().optional(),
    _uploadPassport: z.boolean().optional(),
}).refine(
    (data) => data.eventType !== null && data.eventType !== undefined && data.eventType !== '',
    {
        message: 'Event Type is required',
        path: ['eventType'],
    }
).refine(
    (data) => data.eventId !== null && data.eventId !== undefined,
    {
        message: 'Event is required',
        path: ['eventId'],
    }
).refine(
    (data) => data.organizationId !== null && data.organizationId !== undefined,
    {
        message: 'Organization is required',
        path: ['organizationId'],
    }
).refine(
    (data) => data.sportId !== null && data.sportId !== undefined,
    {
        message: 'Sport is required',
        path: ['sportId'],
    }
).refine(
    (data) => {
        if (data.role === 'Athlete' && !data.categoryId) {
            return false;
        }
        return true;
    },
    {
        message: 'Athletes must select a category',
        path: ['categoryId'],
    }
).refine(
    (data) => {
        if (data.role === 'Leader' && !data.leaderRole) {
            return false;
        }
        return true;
    },
    {
        message: 'Leaders must have a role assigned',
        path: ['leaderRole'],
    }
);

export type RegisterFormData = z.infer<typeof registerSchema>;
