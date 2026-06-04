import * as z from 'zod';

export const registerResponseSchema = z.object({
    status:   z.string(),
    enroll_id: z.number().int(),
    user_id:  z.string(),
}).strict();

export type RegisterResponseParsed = z.infer<typeof registerResponseSchema>;

export const enrollmentSchema = z.object({
    id: z.number().int(),
    user_id: z.string(),
    event_id: z.number().int(),
    organization_id: z.number().int(),
    sport_id: z.number().int(),
    category_id: z.number().int().nullable().optional(),
    kh_family_name: z.string(),
    kh_given_name: z.string(),
    en_family_name: z.string(),
    en_given_name: z.string(),
    phone: z.string(),
    gender: z.string(),
    date_of_birth: z.string(),
    id_document_type: z.string(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    role: z.string(),
    leader_role: z.string().nullable().optional(),
    photo_url: z.string().nullable().optional(),
    birth_certificate_url: z.string().nullable().optional(),
    national_id_url: z.string().nullable().optional(),
    passport_url: z.string().nullable().optional(),
    created_at: z.string(),
    event_name: z.string().optional(),
    org_name: z.string().optional(),
    sport_name: z.string().optional(),
    category_name: z.string().optional(),
}).strict();

export type EnrollmentParsed = z.infer<typeof enrollmentSchema>;

export const enrollmentListSchema = z.object({
    data:  enrollmentSchema.array(),
    count: z.number().int().nonnegative(),
}).strict();

export type EnrollmentListParsed = z.infer<typeof enrollmentListSchema>;

/* ------------------------------------------------------------------ *
 * Registration form (RHF input) validation schema.
 * Client-side UX validation only — the adapter still parses every
 * server response and the backend re-validates all input.
 * ------------------------------------------------------------------ */

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
    eventId: z.number().min(1, 'Event is required').nullable(),
    organizationId: z.string().min(1, 'Organization is required').nullable(),
    sportId: z.number().min(1, 'Sport is required').nullable(),
    categoryId: z.number().min(1, 'Category is required').nullable(),

    // Personal information
    khFamilyName: z.string().trim().min(1, 'Khmer family name is required'),
    khGivenName: z.string().trim().min(1, 'Khmer given name is required'),
    enFamilyName: z.string().trim().min(1, 'English family name is required'),
    enGivenName: z.string().trim().min(1, 'English given name is required'),
    gender: z.string()
        .toUpperCase()
        .pipe(z.enum(['MALE', 'FEMALE', 'OTHER'], { error: 'Please select a gender' })),
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
    idDocumentType: z.string()
        .toUpperCase()
        .pipe(z.enum(['IDCARD', 'BIRTHCERTIFICATE', 'PASSPORT', 'FAMILYBOOK', 'OTHER'])),
    address: z.string().trim().optional(),

    // Role information
    role: z.string()
        .toLowerCase()
        .pipe(z.enum(['athlete', 'leader'])),
    leaderRole: z.string()
        .optional()
        .refine((val) => !val || val.length > 0, 'Leader role cannot be empty'),

    // Document paths
    photoPath: z.string().url('Profile photo is required').min(1, 'Profile photo is required').nullable(),
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
        if (data.role === 'athlete' && !data.categoryId) {
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
        if (data.role === 'leader' && !data.leaderRole) {
            return false;
        }
        return true;
    },
    {
        message: 'Leaders must have a role assigned',
        path: ['leaderRole'],
    }
);

export type RegisterFormInput = z.input<typeof registerSchema>;
export type RegisterFormData = z.output<typeof registerSchema>;
