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
